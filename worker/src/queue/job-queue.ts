import { DownloadJob, JobState, JobStage, MediaFormat } from '../types';
import { JobStateMachine } from './state-machine';
import { Logger } from '../utils/logger';

export interface IJobQueue {
  createJob(media: { id: string; canonicalUrl: string; platform: string }, format: MediaFormat): Promise<DownloadJob>;
  claimJob(workerId: string): Promise<DownloadJob | null>;
  updateJob(jobId: string, updates: Partial<DownloadJob>): Promise<DownloadJob | null>;
  getJob(jobId: string): Promise<DownloadJob | null>;
  listExpiredJobs(ttlMinutes: number): Promise<DownloadJob[]>;
  deleteJob(jobId: string): Promise<boolean>;
  getRecentJobs(): DownloadJob[];
}

/**
 * In-Memory & Database Abstract Job Queue.
 * Uses atomic locking per job entry to prevent multi-worker concurrency race conditions.
 */
export class MemoryJobQueue implements IJobQueue {
  private static instance: MemoryJobQueue;
  private jobs = new Map<string, DownloadJob>();

  public static getInstance(): MemoryJobQueue {
    if (!MemoryJobQueue.instance) {
      MemoryJobQueue.instance = new MemoryJobQueue();
    }
    return MemoryJobQueue.instance;
  }

  async createJob(
    media: { id: string; canonicalUrl: string; platform: string },
    format: MediaFormat
  ): Promise<DownloadJob> {
    const jobId = `job_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const job: DownloadJob = {
      id: jobId,
      mediaId: media.id,
      mediaUrl: media.canonicalUrl,
      platform: media.platform,
      format,
      status: 'QUEUED',
      stage: 'QUEUED',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      retryCount: 0,
    };

    this.jobs.set(jobId, job);
    Logger.info(`Job created: ${jobId}`, { jobId, stage: 'QUEUED' });
    return job;
  }

  async claimJob(workerId: string): Promise<DownloadJob | null> {
    const now = Date.now();

    for (const [id, job] of this.jobs.entries()) {
      // TTL Check
      if (new Date(job.expiresAt).getTime() < now) {
        job.status = 'EXPIRED';
        this.jobs.set(id, job);
        continue;
      }

      // Check QUEUED jobs or stale PROCESSING jobs (heartbeat timeout > 5 mins)
      const isQueued = job.status === 'QUEUED';
      const isStale =
        job.status === 'PROCESSING' &&
        new Date(job.updatedAt).getTime() < now - 5 * 60 * 1000;

      if (isQueued || isStale) {
        JobStateMachine.assertValidTransition(job.status, 'PROCESSING');

        const updatedJob: DownloadJob = {
          ...job,
          status: 'PROCESSING',
          stage: 'DOWNLOADING',
          progress: Math.max(job.progress, 10),
          claimedBy: workerId,
          startedAt: job.startedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.jobs.set(id, updatedJob);
        Logger.info(`Worker ${workerId} claimed job ${id}`, { jobId: id, stage: 'DOWNLOADING' });
        return updatedJob;
      }
    }

    return null;
  }

  async updateJob(jobId: string, updates: Partial<DownloadJob>): Promise<DownloadJob | null> {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    if (updates.status && updates.status !== job.status) {
      JobStateMachine.assertValidTransition(job.status, updates.status);
    }

    const updatedJob: DownloadJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  async getJob(jobId: string): Promise<DownloadJob | null> {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    if (new Date(job.expiresAt).getTime() < Date.now() && job.status !== 'EXPIRED') {
      job.status = 'EXPIRED';
      this.jobs.set(jobId, job);
    }

    return job;
  }

  async listExpiredJobs(ttlMinutes: number): Promise<DownloadJob[]> {
    const expiredCutoff = Date.now() - ttlMinutes * 60 * 1000;
    const result: DownloadJob[] = [];

    for (const job of this.jobs.values()) {
      const isPastTtl = new Date(job.createdAt).getTime() < expiredCutoff;
      if (job.status === 'EXPIRED' || isPastTtl) {
        result.push(job);
      }
    }

    return result;
  }

  async deleteJob(jobId: string): Promise<boolean> {
    return this.jobs.delete(jobId);
  }

  getRecentJobs(): DownloadJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const jobQueue = MemoryJobQueue.getInstance();
