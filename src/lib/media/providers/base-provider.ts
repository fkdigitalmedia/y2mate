import { MediaProvider, ProviderCapability } from './types';
import { MediaResult, MediaFormat } from '../types';

export abstract class AbstractMediaProvider implements MediaProvider {
  public abstract id: string;
  public abstract name: string;
  public abstract platformId: string;
  public abstract domains: string[];
  public enabled = true;
  public priority = 100;

  public detect(url: string): boolean {
    const lower = url.toLowerCase();
    return this.domains.some((domain) => lower.includes(domain.toLowerCase()));
  }

  public abstract analyze(url: string, sanitizedUrl: string): Promise<MediaResult>;

  public getFormats(media: MediaResult): MediaFormat[] {
    return media.formats || [];
  }

  public async prepareSource(media: MediaResult, format: MediaFormat): Promise<string> {
    return media.canonicalUrl || media.url;
  }

  public supports(format: MediaFormat): boolean {
    return true;
  }

  public getCapabilities(): ProviderCapability[] {
    return [
      'VIDEO_METADATA',
      'VIDEO_DOWNLOAD',
      'AUDIO_EXTRACTION',
      'FORMAT_SELECTION',
      'QUALITY_SELECTION',
      'THUMBNAIL',
      'DURATION',
      'FILE_SIZE',
    ];
  }
}
