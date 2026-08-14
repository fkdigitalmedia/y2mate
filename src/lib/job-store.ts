import { downloadJobManager } from './media/job-manager';
import { MediaFormat, DownloadJob } from './media/types';

export async function createDownloadJob(url: string, platform: string, format: MediaFormat): Promise<DownloadJob> {
  const dummyMedia = {
    id: `media_${Date.now()}`,
    url,
    canonicalUrl: url,
    platform,
    platformId: platform.toLowerCase(),
    title: 'Media Download',
    thumbnail: '',
    duration: 0,
    formats: [format],
    analyzedAt: new Date().toISOString(),
  };

  return await downloadJobManager.createJob(dummyMedia, format);
}

export async function getDownloadJob(jobId: string): Promise<DownloadJob | null> {
  return await downloadJobManager.getJob(jobId);
}
