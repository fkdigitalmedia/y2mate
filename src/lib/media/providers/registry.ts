import { MediaProvider } from './types';
import { circuitBreaker } from './circuit-breaker';
import { AbstractMediaProvider } from './base-provider';
import { MediaResult } from '../types';

class YouTubePrimaryProvider extends AbstractMediaProvider {
  public id = 'youtube-primary';
  public name = 'YouTube Engine (Primary)';
  public platformId = 'youtube';
  public domains = ['youtube.com', 'youtu.be'];
  public priority = 100;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    const videoIdMatch = sanitizedUrl.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : 'dQw4w9WgXcQ';

    return {
      id: `yt_${videoId}`,
      url,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      platform: 'YouTube',
      platformId: 'youtube',
      title: 'Nature Relaxation & Cinematic Landscapes (4K)',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 522,
      uploader: 'Cinematic Nature Showcase',
      channelUrl: 'https://youtube.com',
      analyzedAt: new Date().toISOString(),
      formats: [
        {
          id: `yt_${videoId}_v1080p`,
          type: 'video',
          extension: 'mp4',
          quality: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '~54.2 MB',
          mimeType: 'video/mp4',
          downloadable: true,
          requiresProcessing: false,
          isPopular: true,
        },
        {
          id: `yt_${videoId}_v720p`,
          type: 'video',
          extension: 'mp4',
          quality: '720p HD',
          resolution: '1280x720',
          fileSize: '~28.4 MB',
          mimeType: 'video/mp4',
          downloadable: true,
          requiresProcessing: false,
        },
        {
          id: `yt_${videoId}_a320k`,
          type: 'audio',
          extension: 'mp3',
          quality: '320 kbps High Quality',
          bitrate: '320 kbps',
          fileSize: '~10.2 MB',
          mimeType: 'audio/mpeg',
          downloadable: true,
          requiresProcessing: true,
          isPopular: true,
        },
      ],
    };
  }
}

class YouTubeFallbackProvider extends AbstractMediaProvider {
  public id = 'youtube-fallback';
  public name = 'YouTube Engine (Fallback)';
  public platformId = 'youtube';
  public domains = ['youtube.com', 'youtu.be'];
  public priority = 50;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    const videoIdMatch = sanitizedUrl.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : 'dQw4w9WgXcQ';

    return {
      id: `yt_fallback_${videoId}`,
      url,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      platform: 'YouTube',
      platformId: 'youtube',
      title: 'Nature Relaxation & Cinematic Landscapes (4K - Fallback)',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: 522,
      uploader: 'Cinematic Nature Showcase',
      analyzedAt: new Date().toISOString(),
      formats: [
        {
          id: `yt_${videoId}_v720p_fb`,
          type: 'video',
          extension: 'mp4',
          quality: '720p HD',
          resolution: '1280x720',
          fileSize: '~28.4 MB',
          mimeType: 'video/mp4',
          downloadable: true,
          requiresProcessing: false,
        },
        {
          id: `yt_${videoId}_a128k_fb`,
          type: 'audio',
          extension: 'mp3',
          quality: '128 kbps Standard',
          bitrate: '128 kbps',
          fileSize: '~4.1 MB',
          mimeType: 'audio/mpeg',
          downloadable: true,
          requiresProcessing: true,
        },
      ],
    };
  }
}

class VimeoPrimaryProvider extends AbstractMediaProvider {
  public id = 'vimeo-primary';
  public name = 'Vimeo Engine (Primary)';
  public platformId = 'vimeo';
  public domains = ['vimeo.com'];
  public priority = 100;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    return {
      id: `vimeo_${Date.now()}`,
      url,
      canonicalUrl: sanitizedUrl,
      platform: 'Vimeo',
      platformId: 'vimeo',
      title: 'Cinematic Short Film - Midnight Lights',
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
      duration: 230,
      uploader: 'Creative Visuals Studio',
      analyzedAt: new Date().toISOString(),
      formats: [
        {
          id: `vm_${Date.now()}_v1080p`,
          type: 'video',
          extension: 'mp4',
          quality: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '~38.0 MB',
          mimeType: 'video/mp4',
          downloadable: true,
          requiresProcessing: false,
          isPopular: true,
        },
      ],
    };
  }
}

class TikTokPrimaryProvider extends AbstractMediaProvider {
  public id = 'tiktok-primary';
  public name = 'TikTok Engine (Primary)';
  public platformId = 'tiktok';
  public domains = ['tiktok.com'];
  public priority = 100;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    return {
      id: `tt_${Date.now()}`,
      url,
      canonicalUrl: sanitizedUrl,
      platform: 'TikTok',
      platformId: 'tiktok',
      title: 'Trending Creative Short Edit & Beat Sync',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      duration: 45,
      uploader: 'CreativeCreator',
      analyzedAt: new Date().toISOString(),
      formats: [
        {
          id: `tt_${Date.now()}_hd`,
          type: 'video',
          extension: 'mp4',
          quality: 'HD Video (No Watermark)',
          resolution: '1080x1920',
          fileSize: '~9.2 MB',
          mimeType: 'video/mp4',
          downloadable: true,
          requiresProcessing: false,
          isPopular: true,
        },
      ],
    };
  }
}

class GenericWebProvider extends AbstractMediaProvider {
  public id = 'generic-web';
  public name = 'Web Stream Engine';
  public platformId = 'generic-web';
  public domains = [];
  public priority = 10;

  public detect(): boolean {
    return true; // Fallback for any HTTP URL
  }

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    return {
      id: `web_${Date.now()}`,
      url,
      canonicalUrl: sanitizedUrl,
      platform: 'Web Stream',
      platformId: 'generic-web',
      title: 'Sample Direct Web Media Stream',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      duration: 180,
      analyzedAt: new Date().toISOString(),
      formats: [
        {
          id: `web_${Date.now()}_v720p`,
          type: 'video',
          extension: 'mp4',
          quality: '720p MP4 Stream',
          resolution: '1280x720',
          mimeType: 'video/mp4',
          downloadable: true,
          requiresProcessing: false,
          isPopular: true,
        },
      ],
    };
  }
}

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers = new Map<string, MediaProvider>();

  private constructor() {
    this.registerBuiltInProviders();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public registerProvider(provider: MediaProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): MediaProvider | null {
    return this.providers.get(id) || null;
  }

  public getProvidersForPlatform(platformId: string): MediaProvider[] {
    return Array.from(this.providers.values())
      .filter((p) => p.platformId === platformId && p.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  public getAllProviders(): MediaProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Selects the highest priority healthy provider for a platform.
   */
  public selectProvider(platformId: string, url: string): MediaProvider | null {
    const candidates = this.getProvidersForPlatform(platformId);

    for (const provider of candidates) {
      if (circuitBreaker.canExecute(provider.id) && provider.detect(url)) {
        return provider;
      }
    }

    // Fallback to generic-web if enabled & healthy
    const generic = this.providers.get('generic-web');
    if (generic && generic.enabled && circuitBreaker.canExecute(generic.id)) {
      return generic;
    }

    return null;
  }

  private registerBuiltInProviders() {
    this.registerProvider(new YouTubePrimaryProvider());
    this.registerProvider(new YouTubeFallbackProvider());
    this.registerProvider(new VimeoPrimaryProvider());
    this.registerProvider(new TikTokPrimaryProvider());
    this.registerProvider(new GenericWebProvider());
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
