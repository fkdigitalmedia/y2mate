import { workerConfig } from './config';
import { jobQueue } from './queue/job-queue';
import { mediaJobProcessor } from './processors/media-processor';
import { storageProvider } from './storage/storage-provider';
import { cleanupService } from './utils/cleanup';
import { Logger } from './utils/logger';

class WorkerRunner {
  private isRunning = false;
  private activeJobsCount = 0;
  private cleanupInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;

  public async start() {
    this.isRunning = true;

    Logger.info(`y2matevideo.com Processing Worker Service Online`, {
      workerId: workerConfig.workerId,
      concurrency: workerConfig.concurrency,
      storageProvider: workerConfig.storageProvider,
      maxInputSizeMb: workerConfig.maxInputFileSizeMb,
      timeoutSeconds: workerConfig.processingTimeoutSeconds,
    });

    // Send initial worker heartbeat
    this.sendHeartbeat();

    // Schedule 30-second worker heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30 * 1000);

    // Schedule 15-minute background cleanup cycle
    this.cleanupInterval = setInterval(() => {
      cleanupService.runCleanupCycle().catch((err) => {
        Logger.error(`Cleanup cycle failed: ${err.message}`);
      });
    }, 15 * 60 * 1000);

    // Register OS signal handlers for graceful worker shutdown
    process.on('SIGINT', () => this.stop('SIGINT'));
    process.on('SIGTERM', () => this.stop('SIGTERM'));

    // Main processing polling loop
    while (this.isRunning) {
      if (this.activeJobsCount < workerConfig.concurrency) {
        try {
          const job = await jobQueue.claimJob(workerConfig.workerId);

          if (job) {
            this.activeJobsCount++;
            // Execute job asynchronously within concurrency limit
            this.executeJob(job).finally(() => {
              this.activeJobsCount--;
            });
          }
        } catch (err: any) {
          Logger.error(`Worker loop claim error: ${err.message}`);
        }
      }

      // Idle poll interval
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  private sendHeartbeat() {
    Logger.info(`Worker heartbeat sent (${workerConfig.workerId})`, {
      workerId: workerConfig.workerId,
      activeJobs: this.activeJobsCount,
      timestamp: new Date().toISOString(),
    });
  }

  private async executeJob(job: any) {
    const jobId = job.id;
    Logger.jobProgress(jobId, 'DOWNLOADING', 10, `Claimed by ${workerConfig.workerId}`);

    try {
      const result = await mediaJobProcessor.processJob(job, async (stage, progress) => {
        await jobQueue.updateJob(jobId, { stage, progress });
        Logger.jobProgress(jobId, stage, progress);
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

        Logger.jobProgress(jobId, 'COMPLETED', 100, `Result key: ${result.fileKey}`);
      } else {
        const isFatalError =
          result.errorCode === 'FILE_TOO_LARGE' ||
          result.errorCode === 'CONTENT_NOT_SUPPORTED' ||
          result.errorCode === 'PRIVATE_CONTENT' ||
          result.errorCode === 'INVALID_SOURCE';

        const currentRetry = job.retryCount || 0;

        // Exponential backoff retry logic for non-fatal transient failures
        if (!isFatalError && currentRetry < workerConfig.maxJobRetries) {
          const nextRetry = currentRetry + 1;
          Logger.warn(`Job ${jobId} failed (${result.error}). Retrying (${nextRetry}/${workerConfig.maxJobRetries})...`, { jobId });

          await jobQueue.updateJob(jobId, {
            status: 'QUEUED',
            stage: 'QUEUED',
            progress: 0,
            retryCount: nextRetry,
            errorMessage: `Retry attempt ${nextRetry}: ${result.error}`,
          });
        } else {
          await jobQueue.updateJob(jobId, {
            status: 'FAILED',
            stage: 'FAILED',
            errorCode: result.errorCode || 'PROCESSING_ERROR',
            errorMessage: result.error || 'Media processing failed.',
            failedAt: new Date().toISOString(),
          });

          Logger.jobProgress(jobId, 'FAILED', job.progress, `Error: ${result.error}`);
        }
      }
    } catch (err: any) {
      await jobQueue.updateJob(jobId, {
        status: 'FAILED',
        stage: 'FAILED',
        errorCode: 'INTERNAL_ERROR',
        errorMessage: err.message || 'Worker processing exception.',
        failedAt: new Date().toISOString(),
      });

      Logger.jobProgress(jobId, 'FAILED', 0, `Exception: ${err.message}`);
    }
  }

  public stop(signal: string) {
    Logger.info(`Worker received ${signal}. Gracefully stopping worker process...`);
    this.isRunning = false;
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    setTimeout(() => {
      Logger.info(`Worker process terminated.`);
      process.exit(0);
    }, 2000);
  }
}

// Start worker service
if (require.main === module) {
  const runner = new WorkerRunner();
  runner.start();
}
