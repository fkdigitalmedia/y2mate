import { MediaProvider } from './types';
import { circuitBreaker } from './circuit-breaker';
import { AbstractMediaProvider } from './base-provider';
import { MediaResult } from '../types';
import { buildDynamicMediaResult } from '../dynamic-metadata';

class YouTubePrimaryProvider extends AbstractMediaProvider {
  public id = 'youtube-primary';
  public name = 'YouTube Engine (Primary)';
  public platformId = 'youtube';
  public domains = ['youtube.com', 'youtu.be'];
  public priority = 100;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    return buildDynamicMediaResult(url, sanitizedUrl, 'YouTube', 'youtube');
  }
}

class YouTubeFallbackProvider extends AbstractMediaProvider {
  public id = 'youtube-fallback';
  public name = 'YouTube Engine (Fallback)';
  public platformId = 'youtube';
  public domains = ['youtube.com', 'youtu.be'];
  public priority = 50;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    return buildDynamicMediaResult(url, sanitizedUrl, 'YouTube (Fallback)', 'youtube');
  }
}

class VimeoPrimaryProvider extends AbstractMediaProvider {
  public id = 'vimeo-primary';
  public name = 'Vimeo Engine (Primary)';
  public platformId = 'vimeo';
  public domains = ['vimeo.com'];
  public priority = 100;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    return buildDynamicMediaResult(url, sanitizedUrl, 'Vimeo', 'vimeo');
  }
}

class TikTokPrimaryProvider extends AbstractMediaProvider {
  public id = 'tiktok-primary';
  public name = 'TikTok Engine (Primary)';
  public platformId = 'tiktok';
  public domains = ['tiktok.com'];
  public priority = 100;

  public async analyze(url: string, sanitizedUrl: string): Promise<MediaResult> {
    return buildDynamicMediaResult(url, sanitizedUrl, 'TikTok', 'tiktok');
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
    return buildDynamicMediaResult(url, sanitizedUrl, 'Web Stream', 'generic-web');
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
