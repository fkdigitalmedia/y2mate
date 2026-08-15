import http from 'http';
import { URL } from 'url';
import { spawnSync } from 'child_process';
import { workerConfig, resolveFFmpegExecutable } from './config';
import { jobQueue } from './queue/job-queue';
import { mediaJobProcessor } from './processors/media-processor';
import { storageProvider } from './storage/storage-provider';
import { cleanupService } from './utils/cleanup';
import { Logger } from './utils/logger';

class WorkerRunner {
  private isRunning = false;
  private activeJobsCount = 0;
  private ffmpegAvailable = false;
  private ffmpegVersion = 'unknown';
  private resolvedFFmpegPath = '';
  private cleanupInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;
  private httpServer?: http.Server;

  private checkFFmpegAvailability() {
    this.resolvedFFmpegPath = resolveFFmpegExecutable();
    try {
      const res = spawnSync(this.resolvedFFmpegPath, ['-version'], { windowsHide: true });
      if (res.status === 0) {
        this.ffmpegAvailable = true;
        const stdout = res.stdout ? res.stdout.toString() : '';
        const match = stdout.match(/ffmpeg version ([^\s]+)/i);
        this.ffmpegVersion = match ? match[1] : 'installed';
      } else {
        this.ffmpegAvailable = false;
      }
    } catch {
      this.ffmpegAvailable = false;
    }

    if (this.ffmpegAvailable) {
      Logger.info(`WORKER_STARTED`, {
        workerId: workerConfig.workerId,
        FFMPEG_PATH: this.resolvedFFmpegPath,
        FFMPEG_VERSION: this.ffmpegVersion,
        FFMPEG_AVAILABLE: true,
      });
    } else {
      Logger.error(`FFMPEG_NOT_FOUND`, {
        workerId: workerConfig.workerId,
        FFMPEG_PATH: this.resolvedFFmpegPath,
        FFMPEG_AVAILABLE: false,
        message: 'FFmpeg binary not accessible on worker host. Worker unhealthy for processing jobs.',
      });
    }
  }

  public async start() {
    this.isRunning = true;

    // Execute safe FFmpeg startup availability check & diagnostic logging
    this.checkFFmpegAvailability();

    Logger.info(`y2matevideo.com Processing Worker Service Online`, {
      workerId: workerConfig.workerId,
      concurrency: workerConfig.concurrency,
      storageProvider: workerConfig.storageProvider,
      maxInputSizeMb: workerConfig.maxInputFileSizeMb,
      timeoutSeconds: workerConfig.processingTimeoutSeconds,
      ffmpegAvailable: this.ffmpegAvailable,
    });

    // Start Built-in Worker HTTP API Server for direct Vercel RPC execution
    const port = parseInt(process.env.PORT || '4000', 10);
    this.httpServer = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

      if (reqUrl.pathname === '/api/worker/health' || reqUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'ok',
          workerId: workerConfig.workerId,
          ffmpegAvailable: this.ffmpegAvailable,
          activeJobs: this.activeJobsCount,
          storageProvider: workerConfig.storageProvider,
        }));
      }

      if (reqUrl.pathname === '/api/worker/status' && req.method === 'GET') {
        const jobId = reqUrl.searchParams.get('jobId');
        if (!jobId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing jobId parameter' }));
        }
        const job = await jobQueue.getJob(jobId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, job }));
      }

      if (reqUrl.pathname === '/api/worker/process' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const job = parsed.job || parsed;
            if (!job || !job.id) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Missing job object' }));
            }

            Logger.info(`Received HTTP process dispatch for job ${job.id}`, { jobId: job.id });

            // Initialize job in queue
            await jobQueue.updateJob(job.id, {
              status: 'PROCESSING',
              stage: 'DOWNLOADING',
              progress: 15,
            });

            // Asynchronously process job with yt-dlp and FFmpeg
            this.activeJobsCount++;
            this.executeJob(job).finally(() => {
              this.activeJobsCount--;
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, jobId: job.id, status: 'PROCESSING' }));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    this.httpServer.listen(port, '0.0.0.0', () => {
      Logger.info(`Worker HTTP Server listening on http://0.0.0.0:${port}`);
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
            if (!this.ffmpegAvailable) {
              Logger.error(`FFMPEG_UNAVAILABLE: Cannot process job ${job.id} because FFmpeg is missing on worker host.`);
              await jobQueue.updateJob(job.id, {
                status: 'FAILED',
                stage: 'FAILED',
                errorCode: 'FFMPEG_UNAVAILABLE',
                errorMessage: 'Media processing engine is temporarily unavailable on worker host.',
                failedAt: new Date().toISOString(),
              });
              continue;
            }

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
