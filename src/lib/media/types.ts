export type MediaType = 'video' | 'audio';

export type JobState = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

export type JobStage = 'QUEUED' | 'DOWNLOADING' | 'PROCESSING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';

export interface MediaFormat {
  id: string;
  type: MediaType;
  extension: string; // e.g. "mp4", "webm", "mp3", "m4a"
  quality: string; // e.g. "1080p", "720p", "320 kbps"
  resolution?: string; // e.g. "1920x1080"
  bitrate?: string; // e.g. "320 kbps"
  fileSize?: string; // e.g. "Estimated size: ~42.5 MB" or "Size unavailable"
  fileSizeType?: 'actual' | 'estimated' | 'unknown';
  mimeType: string;
  downloadable: boolean;
  requiresProcessing: boolean;
  isPopular?: boolean;
}

export interface MediaResult {
  id: string;
  url: string;
  canonicalUrl: string;
  platform: string;
  platformId: string;
  title: string;
  thumbnail: string;
  duration: number | string; // in seconds or formatted string "05:32"
  uploader?: string;
  channelUrl?: string;
  formats: MediaFormat[];
  analyzedAt: string;
}

export interface DownloadJob {
  id: string;
  mediaId: string;
  mediaUrl: string;
  platform: string;
  format: MediaFormat;
  status: JobState;
  stage: JobStage;
  progress: number; // 0 to 100
  downloadUrl?: string;
  fileKey?: string;
  fileSize?: string;
  fileName?: string;
  mimeType?: string;
  errorCode?: string;
  errorMessage?: string;
  claimedBy?: string;
  retryCount?: number;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface PlatformCapabilities {
  supportsVideo: boolean;
  supportsAudioExtraction: boolean;
  supportsDirectDownload: boolean;
  requiresProcessing: boolean;
}

export interface PlatformInfo {
  id: string;
  name: string;
  domains: string[];
  enabled: boolean;
  capabilities: PlatformCapabilities;
}

export interface PlatformProvider extends PlatformInfo {
  analyze(url: string, sanitizedUrl: string): Promise<MediaResult>;
}

export interface AnalysisRequest {
  url: string;
}

export interface AnalysisResponse {
  success: boolean;
  data?: MediaResult;
  error?: {
    code: string;
    message: string;
  };
}

export interface DownloadRequest {
  mediaId: string;
  formatId: string;
  url: string;
}

export interface DownloadResponse {
  success: boolean;
  jobId?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface JobStatusResponse {
  success: boolean;
  job?: DownloadJob;
  error?: {
    code: string;
    message: string;
  };
}
