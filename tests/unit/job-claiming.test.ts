import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryJobQueue } from '../../worker/src/queue/job-queue';

describe('Job Claiming & Concurrency', () => {
  let queue: MemoryJobQueue;

  beforeEach(() => {
    queue = new MemoryJobQueue();
  });

  it('allows worker-1 to claim a QUEUED job', async () => {
    const job = await queue.createJob(
      { id: 'm1', canonicalUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ', platform: 'YouTube' },
      { id: 'f1', type: 'video', extension: 'mp4', quality: '1080p', mimeType: 'video/mp4', downloadable: true, requiresProcessing: false }
    );

    const claimed = await queue.claimJob('worker-node-1');
    expect(claimed).not.toBeNull();
    expect(claimed?.id).toBe(job.id);
    expect(claimed?.status).toBe('PROCESSING');
    expect(claimed?.claimedBy).toBe('worker-node-1');
  });

  it('prevents worker-2 from claiming an already claimed job', async () => {
    await queue.createJob(
      { id: 'm1', canonicalUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ', platform: 'YouTube' },
      { id: 'f1', type: 'video', extension: 'mp4', quality: '1080p', mimeType: 'video/mp4', downloadable: true, requiresProcessing: false }
    );

    const claimedByWorker1 = await queue.claimJob('worker-node-1');
    expect(claimedByWorker1).not.toBeNull();

    // Worker 2 attempts to claim
    const claimedByWorker2 = await queue.claimJob('worker-node-2');
    expect(claimedByWorker2).toBeNull();
  });
});
