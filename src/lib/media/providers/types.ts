import { MediaResult, MediaFormat } from '../types';

export type ProviderCapability =
  | 'VIDEO_METADATA'
  | 'VIDEO_DOWNLOAD'
  | 'AUDIO_EXTRACTION'
  | 'FORMAT_SELECTION'
  | 'QUALITY_SELECTION'
  | 'THUMBNAIL'
  | 'DURATION'
  | 'FILE_SIZE';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ProviderHealthMetrics {
  providerId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  circuitState: CircuitState;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  lastSuccess?: string;
  lastFailure?: string;
  avgResponseMs: number;
}

export interface MediaProvider {
  id: string;
  name: string;
  platformId: string;
  domains: string[];
  enabled: boolean;
  priority: number;

  detect(url: string): boolean;
  analyze(url: string, sanitizedUrl: string): Promise<MediaResult>;
  getFormats(media: MediaResult): MediaFormat[];
  prepareSource(media: MediaResult, format: MediaFormat): Promise<string>;
  supports(format: MediaFormat): boolean;
  getCapabilities(): ProviderCapability[];
}
