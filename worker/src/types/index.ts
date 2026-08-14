import { DownloadJob, MediaFormat, JobState, JobStage } from '@/lib/media/types';

export type { DownloadJob, MediaFormat, JobState, JobStage };

export interface ProcessMediaJobParams {
  job: DownloadJob;
  onProgress?: (progress: number, stage: JobStage) => Promise<void>;
}

export interface ProcessingResult {
  success: boolean;
  fileKey?: string;
  fileSize?: string;
  fileName?: string;
  mimeType?: string;
  error?: string;
  errorCode?: string;
}

export interface StorageMetadata {
  key: string;
  size: number;
  mimeType: string;
  createdAt: Date;
}
