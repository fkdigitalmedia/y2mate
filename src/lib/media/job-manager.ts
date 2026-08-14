import { DownloadJob, MediaResult, MediaFormat } from './types';
import { jobQueue } from '@worker/queue/job-queue';
import { storageProvider } from '@worker/storage/storage-provider';

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

    return job;
  }

  public async getJob(jobId: string): Promise<DownloadJob | null> {
    const job = await jobQueue.getJob(jobId);
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
