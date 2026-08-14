import { PlatformProvider, MediaResult, MediaFormat } from './types';

export class PlatformRegistry {
  private static instance: PlatformRegistry;
  private providers = new Map<string, PlatformProvider>();

  private constructor() {
    this.registerBuiltInProviders();
  }

  public static getInstance(): PlatformRegistry {
    if (!PlatformRegistry.instance) {
      PlatformRegistry.instance = new PlatformRegistry();
    }
    return PlatformRegistry.instance;
  }

  public registerProvider(provider: PlatformProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProviderForDomain(domain: string): PlatformProvider | null {
    const lowerDomain = domain.toLowerCase();
    const providersList = Array.from(this.providers.values());
    for (const provider of providersList) {
      if (provider.domains.some((d) => lowerDomain.includes(d.toLowerCase()))) {
        return provider;
      }
    }
    // Fallback to generic web video provider if enabled
    return this.providers.get('generic-web') || null;
  }

  public getAllProviders(): PlatformProvider[] {
    return Array.from(this.providers.values());
  }

  private registerBuiltInProviders() {
    // 1. YouTube Provider
    this.registerProvider({
      id: 'youtube',
      name: 'YouTube',
      domains: ['youtube.com', 'youtu.be'],
      enabled: true,
      capabilities: {
        supportsVideo: true,
        supportsAudioExtraction: true,
        supportsDirectDownload: true,
        requiresProcessing: false,
      },
      async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
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
          duration: 522, // 08:42 in seconds
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
              id: `yt_${videoId}_v480p`,
              type: 'video',
              extension: 'mp4',
              quality: '480p SD',
              resolution: '854x480',
              fileSize: '~14.1 MB',
              mimeType: 'video/mp4',
              downloadable: true,
              requiresProcessing: false,
            },
            {
              id: `yt_${videoId}_v360p`,
              type: 'video',
              extension: 'mp4',
              quality: '360p Compact',
              resolution: '640x360',
              fileSize: '~8.2 MB',
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
            {
              id: `yt_${videoId}_a128k`,
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
      },
    });

    // 2. Vimeo Provider
    this.registerProvider({
      id: 'vimeo',
      name: 'Vimeo',
      domains: ['vimeo.com'],
      enabled: true,
      capabilities: {
        supportsVideo: true,
        supportsAudioExtraction: true,
        supportsDirectDownload: true,
        requiresProcessing: false,
      },
      async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
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
            {
              id: `vm_${Date.now()}_v720p`,
              type: 'video',
              extension: 'mp4',
              quality: '720p HD',
              resolution: '1280x720',
              fileSize: '~19.5 MB',
              mimeType: 'video/mp4',
              downloadable: true,
              requiresProcessing: false,
            },
            {
              id: `vm_${Date.now()}_a256k`,
              type: 'audio',
              extension: 'm4a',
              quality: '256 kbps AAC',
              bitrate: '256 kbps',
              fileSize: '~6.8 MB',
              mimeType: 'audio/mp4',
              downloadable: true,
              requiresProcessing: true,
            },
          ],
        };
      },
    });

    // 3. TikTok Provider
    this.registerProvider({
      id: 'tiktok',
      name: 'TikTok',
      domains: ['tiktok.com'],
      enabled: true,
      capabilities: {
        supportsVideo: true,
        supportsAudioExtraction: true,
        supportsDirectDownload: true,
        requiresProcessing: false,
      },
      async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
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
            {
              id: `tt_${Date.now()}_mp3`,
              type: 'audio',
              extension: 'mp3',
              quality: 'Audio Stream (192 kbps)',
              bitrate: '192 kbps',
              fileSize: '~1.8 MB',
              mimeType: 'audio/mpeg',
              downloadable: true,
              requiresProcessing: true,
            },
          ],
        };
      },
    });

    // 4. Generic Web Video Provider
    this.registerProvider({
      id: 'generic-web',
      name: 'Web Video',
      domains: [],
      enabled: true,
      capabilities: {
        supportsVideo: true,
        supportsAudioExtraction: true,
        supportsDirectDownload: true,
        requiresProcessing: false,
      },
      async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
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
            {
              id: `web_${Date.now()}_a128k`,
              type: 'audio',
              extension: 'mp3',
              quality: '128 kbps MP3',
              bitrate: '128 kbps',
              mimeType: 'audio/mpeg',
              downloadable: true,
              requiresProcessing: true,
            },
          ],
        };
      },
    });
  }
}

export const platformRegistry = PlatformRegistry.getInstance();
