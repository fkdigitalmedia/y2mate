import fs from 'fs';
import path from 'path';
import { workerConfig } from '../config';
import { jobQueue } from '../queue/job-queue';
import { storageProvider } from '../storage/storage-provider';
import { Logger } from './logger';

export class CleanupService {
  /**
   * Run automated cleanup cycle for abandoned temp directories, expired storage objects, and stale jobs.
   */
  public async runCleanupCycle(): Promise<{ purgedTempDirs: number; purgedStorageFiles: number }> {
    let purgedTempDirs = 0;
    let purgedStorageFiles = 0;
    const now = Date.now();
    const ttlMs = workerConfig.jobTtlMinutes * 60 * 1000;

    Logger.info(`Starting scheduled background cleanup cycle (TTL: ${workerConfig.jobTtlMinutes}m)...`);

    // 1. Purge abandoned job temp folders in /tmp/y2matevideo/
    try {
      const tempBase = workerConfig.tempBaseDir;
      if (fs.existsSync(tempBase)) {
        const entries = await fs.promises.readdir(tempBase, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory() && entry.name !== 'storage_vault') {
            const dirPath = path.join(tempBase, entry.name);
            try {
              const stat = await fs.promises.stat(dirPath);
              if (now - stat.mtimeMs > ttlMs) {
                await fs.promises.rm(dirPath, { recursive: true, force: true });
                purgedTempDirs++;
                Logger.info(`Purged abandoned temp workspace: ${entry.name}`);
              }
            } catch (err: any) {
              // Ignore single dir stat errors
            }
          }
        }
      }
    } catch (err: any) {
      Logger.warn(`Temp workspace cleanup cycle warning: ${err.message}`);
    }

    // 2. Purge expired jobs and storage objects
    try {
      const expiredJobs = await jobQueue.listExpiredJobs(workerConfig.jobTtlMinutes);

      for (const job of expiredJobs) {
        if (job.fileKey) {
          const deleted = await storageProvider.deleteFile(job.fileKey);
          if (deleted) purgedStorageFiles++;
        }
        await jobQueue.deleteJob(job.id);
      }
    } catch (err: any) {
      Logger.warn(`Storage object cleanup cycle warning: ${err.message}`);
    }

    Logger.info(`Cleanup cycle complete. Purged ${purgedTempDirs} temp dirs, ${purgedStorageFiles} storage files.`);
    return { purgedTempDirs, purgedStorageFiles };
  }
}

export const cleanupService = new CleanupService();
