import { DownloadJob, MediaResult, MediaFormat } from './types';
import { jobQueue } from '@worker/queue/job-queue';
import { storageProvider } from '@worker/storage/storage-provider';
import { mediaJobProcessor } from '@worker/processors/media-processor';
import { resolveFFmpegExecutable } from '@worker/config';

class DownloadJobManager {
  private static instance: DownloadJobManager;

  public static getInstance(): DownloadJobManager {
    if (!DownloadJobManager.instance) {
      DownloadJobManager.instance = new DownloadJobManager();
    }
    return DownloadJobManager.instance;
  }

  public async createJob(media: MediaResult, format: MediaFormat): Promise<DownloadJob> {
    // Submit job in QUEUED state for worker consumption
    const job = await jobQueue.createJob(
      {
        id: media.id,
        canonicalUrl: media.canonicalUrl || media.url,
        platform: media.platform,
      },
      format
    );

    // Asynchronously trigger server-side worker execution (non-blocking)
    this.processJobAsync(job.id).catch(() => {});

    return job;
  }

  private get workerUrl(): string {
    return process.env.WORKER_URL || 'http://163.192.216.117:4000';
  }

  private async processJobAsync(jobId: string): Promise<void> {
    const ffmpegPath = resolveFFmpegExecutable();

    // If running in serverless environment without FFmpeg (e.g. Vercel),
    // dispatch the job directly to the dedicated Oracle VPS Worker HTTP API!
    if (!ffmpegPath) {
      const job = await jobQueue.getJob(jobId);
      if (!job) return;

      try {
        const res = await fetch(`${this.workerUrl}/api/worker/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job }),
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          await jobQueue.updateJob(jobId, { status: 'PROCESSING', stage: 'DOWNLOADING', progress: 15 });
        }
      } catch (err: any) {
        // Fallback: job remains in database queue for background worker polling
      }
      return;
    }

    // Short delay to allow separate worker process claim if active
    await new Promise((res) => setTimeout(res, 50));

    const job = await jobQueue.getJob(jobId);
    if (!job || job.status !== 'QUEUED') return;

    try {
      await jobQueue.updateJob(jobId, { status: 'PROCESSING', stage: 'DOWNLOADING', progress: 15 });

      const result = await mediaJobProcessor.processJob(job, async (stage, progress) => {
        await jobQueue.updateJob(jobId, { stage, progress });
      });

      if (result.success && result.fileKey) {
        const signedUrl = await storageProvider.createSignedUrl(result.fileKey, 1800);
        await jobQueue.updateJob(jobId, {
          status: 'COMPLETED',
          stage: 'COMPLETED',
          progress: 100,
          downloadUrl: signedUrl,
          fileKey: result.fileKey,
          fileSize: result.fileSize,
          fileName: result.fileName,
          mimeType: result.mimeType,
          completedAt: new Date().toISOString(),
        });
      } else {
        await jobQueue.updateJob(jobId, {
          status: 'FAILED',
          stage: 'FAILED',
          errorCode: result.errorCode || 'PROCESSING_ERROR',
          errorMessage: result.error || 'Media processing failed.',
          failedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      await jobQueue.updateJob(jobId, {
        status: 'FAILED',
        stage: 'FAILED',
        errorCode: 'INTERNAL_ERROR',
        errorMessage: err.message || 'Worker processing exception.',
        failedAt: new Date().toISOString(),
      });
    }
  }

  public async getJob(jobId: string): Promise<DownloadJob | null> {
    let job = await jobQueue.getJob(jobId);

    // If job is still in progress or not in local serverless memory, sync from dedicated worker
    if ((!job || job.status === 'QUEUED' || job.status === 'PROCESSING') && !resolveFFmpegExecutable()) {
      try {
        const res = await fetch(`${this.workerUrl}/api/worker/status?jobId=${jobId}`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.job) {
            job = data.job;
            await jobQueue.updateJob(jobId, data.job);
          }
        }
      } catch {}
    }

    if (!job) return null;

    // Refresh signed URL if job completed and URL missing or expired
    if (job.status === 'COMPLETED' && job.fileKey && !job.downloadUrl) {
      const signedUrl = await storageProvider.createSignedUrl(job.fileKey, 1800);
      job.downloadUrl = signedUrl;
      await jobQueue.updateJob(job.id, { downloadUrl: signedUrl });
    }

    return job;
  }

  public getRecentJobs(): DownloadJob[] {
    return jobQueue.getRecentJobs();
  }
}

export const downloadJobManager = DownloadJobManager.getInstance();
