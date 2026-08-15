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
 * Supabase REST & In-Memory Hybrid Job Queue.
 * Enables zero-delay cross-server job persistence between Vercel Serverless and VPS Worker nodes.
 */
const globalForQueue = globalThis as unknown as {
  __hybridJobQueueInstance?: HybridJobQueue;
  __hybridJobQueueJobs?: Map<string, DownloadJob>;
};

/**
 * Supabase REST & In-Memory Hybrid Job Queue.
 * Enables zero-delay cross-server job persistence between Vercel Serverless and VPS Worker nodes.
 */
export class HybridJobQueue implements IJobQueue {
  private static instance: HybridJobQueue;
  private jobs: Map<string, DownloadJob>;

  constructor() {
    if (!globalForQueue.__hybridJobQueueJobs) {
      globalForQueue.__hybridJobQueueJobs = new Map<string, DownloadJob>();
    }
    this.jobs = globalForQueue.__hybridJobQueueJobs;
  }

  private get supabaseUrl(): string | undefined {
    return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  private get supabaseKey(): string | undefined {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  }

  public static getInstance(): HybridJobQueue {
    if (!globalForQueue.__hybridJobQueueInstance) {
      globalForQueue.__hybridJobQueueInstance = new HybridJobQueue();
    }
    HybridJobQueue.instance = globalForQueue.__hybridJobQueueInstance;
    return HybridJobQueue.instance;
  }

  private async supabaseFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.supabaseUrl || !this.supabaseKey) return null;

    try {
      const url = `${this.supabaseUrl}/rest/v1${endpoint}`;
      const headers = {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers,
      };

      const res = await fetch(url, { ...options, headers });
      if (!res.ok) return null;

      const data = await res.json().catch(() => null);
      return data;
    } catch (err: any) {
      Logger.warn(`Supabase DB queue fetch error: ${err.message}`);
      return null;
    }
  }

  private mapDbToJob(row: any): DownloadJob {
    return {
      id: row.id,
      mediaId: row.media_id,
      mediaUrl: row.media_url,
      platform: row.platform,
      format: typeof row.format === 'string' ? JSON.parse(row.format) : row.format,
      status: row.status as JobState,
      stage: row.stage as JobStage,
      progress: row.progress || 0,
      downloadUrl: row.download_url,
      fileKey: row.file_key,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      claimedBy: row.claimed_by,
      retryCount: row.retry_count || 0,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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

    // Sync to Supabase PostgreSQL DB if configured
    if (this.supabaseUrl && this.supabaseKey) {
      this.supabaseFetch('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          id: jobId,
          media_id: media.id,
          media_url: media.canonicalUrl,
          platform: media.platform,
          format: format,
          status: 'QUEUED',
          stage: 'QUEUED',
          progress: 0,
          created_at: now,
          updated_at: now,
          expires_at: expiresAt,
        }),
      }).catch((err) => Logger.warn(`Failed to sync createJob to Supabase: ${err.message}`));
    }

    // Auto-process job locally if standalone or dev mode (worker daemon not running separately)
    if (process.env.NODE_ENV !== 'production' || process.env.STORAGE_PROVIDER === 'memory' || process.env.STORAGE_PROVIDER === 'local') {
      setTimeout(() => {
        const currentJob = this.jobs.get(jobId);
        if (currentJob && currentJob.status === 'QUEUED') {
          this.autoProcessLocalJob(jobId);
        }
      }, 300);
    }

    Logger.info(`Job created: ${jobId}`, { jobId, stage: 'QUEUED' });
    return job;
  }

  private async autoProcessLocalJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'QUEUED') return;

    try {
      await this.updateJob(jobId, { status: 'PROCESSING', stage: 'DOWNLOADING', progress: 20 });
      await new Promise((res) => setTimeout(res, 400));

      await this.updateJob(jobId, { stage: 'PROCESSING', progress: 60 });
      await new Promise((res) => setTimeout(res, 500));

      await this.updateJob(jobId, { stage: 'UPLOADING', progress: 90 });
      await new Promise((res) => setTimeout(res, 300));

      const fileExt = job.format?.extension || 'mp4';
      const fileKey = `downloads/${jobId}/result.${fileExt}`;
      const dummyDownloadUrl = `/api/download/file/${fileKey}?token=signed_demo_${Date.now()}`;

      await this.updateJob(jobId, {
        status: 'COMPLETED',
        stage: 'COMPLETED',
        progress: 100,
        downloadUrl: dummyDownloadUrl,
        fileKey: fileKey,
        fileSize: job.format?.fileSize || '~15.2 MB',
        fileName: `${job.platform || 'video'}_download.${fileExt}`,
        mimeType: job.format?.mimeType || 'video/mp4',
        completedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      await this.updateJob(jobId, {
        status: 'FAILED',
        stage: 'FAILED',
        errorCode: 'PROCESSING_ERROR',
        errorMessage: err.message || 'Local processing simulation failed.',
        failedAt: new Date().toISOString(),
      });
    }
  }

  async claimJob(workerId: string): Promise<DownloadJob | null> {
    const now = Date.now();

    // 1. Try claiming from Supabase DB first if configured
    if (this.supabaseUrl && this.supabaseKey) {
      const queuedRows = await this.supabaseFetch('/jobs?status=eq.QUEUED&order=created_at.asc&limit=1');
      if (Array.isArray(queuedRows) && queuedRows.length > 0) {
        const dbJob = this.mapDbToJob(queuedRows[0]);
        
        const updateRows = await this.supabaseFetch(`/jobs?id=eq.${dbJob.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'PROCESSING',
            stage: 'DOWNLOADING',
            progress: 10,
            claimed_by: workerId,
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });

        if (Array.isArray(updateRows) && updateRows.length > 0) {
          const claimed = this.mapDbToJob(updateRows[0]);
          this.jobs.set(claimed.id, claimed);
          Logger.info(`Worker ${workerId} claimed DB job ${claimed.id}`, { jobId: claimed.id, stage: 'DOWNLOADING' });
          return claimed;
        }
      }
    }

    // 2. Fallback to local memory claim
    for (const [id, job] of this.jobs.entries()) {
      if (new Date(job.expiresAt).getTime() < now) {
        job.status = 'EXPIRED';
        this.jobs.set(id, job);
        continue;
      }

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
        Logger.info(`Worker ${workerId} claimed memory job ${id}`, { jobId: id, stage: 'DOWNLOADING' });
        return updatedJob;
      }
    }

    return null;
  }

  async updateJob(jobId: string, updates: Partial<DownloadJob>): Promise<DownloadJob | null> {
    const nowIso = new Date().toISOString();
    const existing = this.jobs.get(jobId);

    const updatedJob: DownloadJob = {
      ...(existing || {}),
      ...updates,
      id: jobId,
      updatedAt: nowIso,
    } as DownloadJob;

    this.jobs.set(jobId, updatedJob);

    // Sync to Supabase DB
    if (this.supabaseUrl && this.supabaseKey) {
      const payload: Record<string, any> = { updated_at: nowIso };
      if (updates.status) payload.status = updates.status;
      if (updates.stage) payload.stage = updates.stage;
      if (updates.progress !== undefined) payload.progress = updates.progress;
      if (updates.downloadUrl) payload.download_url = updates.downloadUrl;
      if (updates.fileKey) payload.file_key = updates.fileKey;
      if (updates.fileSize) payload.file_size = updates.fileSize;
      if (updates.mimeType) payload.mime_type = updates.mimeType;
      if (updates.errorCode) payload.error_code = updates.errorCode;
      if (updates.errorMessage) payload.error_message = updates.errorMessage;
      if (updates.claimedBy) payload.claimed_by = updates.claimedBy;
      if (updates.retryCount !== undefined) payload.retry_count = updates.retryCount;
      if (updates.completedAt) payload.completed_at = updates.completedAt;
      if (updates.failedAt) payload.failed_at = updates.failedAt;

      await this.supabaseFetch(`/jobs?id=eq.${jobId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }

    return updatedJob;
  }

  async getJob(jobId: string): Promise<DownloadJob | null> {
    // 1. Check local in-memory Map FIRST
    let job = this.jobs.get(jobId);

    // 2. If not found in memory AND Supabase is configured, check Supabase DB
    if (!job && this.supabaseUrl && this.supabaseKey) {
      const rows = await this.supabaseFetch(`/jobs?id=eq.${jobId}`);
      if (Array.isArray(rows) && rows.length > 0) {
        job = this.mapDbToJob(rows[0]);
        this.jobs.set(jobId, job);
      }
    }

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
    if (this.supabaseUrl && this.supabaseKey) {
      await this.supabaseFetch(`/jobs?id=eq.${jobId}`, { method: 'DELETE' });
    }
    return this.jobs.delete(jobId);
  }

  getRecentJobs(): DownloadJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export { HybridJobQueue as MemoryJobQueue };
export const jobQueue = HybridJobQueue.getInstance();
