import { PlatformInfo, PlatformProvider, MediaResult } from './types';
import { buildDynamicMediaResult } from './dynamic-metadata';

export class PlatformRegistry {
  private static instance: PlatformRegistry;
  private providers = new Map<string, PlatformProvider>();

  private constructor() {
    this.registerBuiltInPlatforms();
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

  public getPlatform(id: string): PlatformProvider | null {
    return this.providers.get(id) || null;
  }

  public getAllPlatforms(): PlatformInfo[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      domains: p.domains,
      enabled: p.enabled,
      capabilities: p.capabilities,
    }));
  }

  public detectPlatform(url: string): PlatformProvider | null {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      return this.getProviderForDomain(hostname);
    } catch (err) {
      return null;
    }
  }

  public getProviderForDomain(domain: string): PlatformProvider | null {
    const domainLower = domain.toLowerCase();
    for (const provider of this.providers.values()) {
      if (!provider.enabled) continue;
      for (const d of provider.domains) {
        if (domainLower.endsWith(d)) {
          return provider;
        }
      }
    }
    return this.providers.get('generic-web') || null;
  }

  private registerBuiltInPlatforms() {
    // 1. YouTube Platform
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
        return buildDynamicMediaResult(url, sanitizedUrl, 'YouTube', 'youtube');
      },
    });

    // 2. Vimeo Platform
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
        return buildDynamicMediaResult(url, sanitizedUrl, 'Vimeo', 'vimeo');
      },
    });

    // 3. TikTok Platform
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
        return buildDynamicMediaResult(url, sanitizedUrl, 'TikTok', 'tiktok');
      },
    });

    // 4. Generic Web Platform
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
        return buildDynamicMediaResult(url, sanitizedUrl, 'Web Stream', 'generic-web');
      },
    });
  }
}

export const platformRegistry = PlatformRegistry.getInstance();
