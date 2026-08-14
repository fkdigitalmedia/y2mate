import { siteConfig } from '@/config/site';
import { seoConfig } from '@/config/seo';

/**
 * Centralized Settings Service.
 * Manages dynamic runtime configuration with fallback to application constants.
 */
class SettingsService {
  private static instance: SettingsService;
  private settingsCache = new Map<string, { value: any; updatedAt: number }>();
  private cacheTtlMs = 10 * 1000; // 10-second memory cache TTL

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get a dynamic setting value by key with typed fallback default.
   */
  public async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const cached = this.settingsCache.get(key);
    if (cached && Date.now() - cached.updatedAt < this.cacheTtlMs) {
      return cached.value as T;
    }

    // Default fallbacks for common keys if database is uninitialized
    const defaultsMap: Record<string, any> = {
      site_name: siteConfig.name,
      site_url: siteConfig.url,
      contact_email: 'support@y2mate.us.cc',
      maintenance_mode: false,
      maintenance_title: 'System Maintenance',
      maintenance_message: 'y2mate is currently undergoing scheduled maintenance. We will be back online shortly.',
      announcement_enabled: false,
      announcement_message: 'Welcome to y2mate! High-speed media downloader engine online.',
      announcement_url: '/video-downloader',
      default_seo_title: seoConfig.defaultTitle,
      default_seo_description: seoConfig.defaultDescription,
      google_analytics_id: process.env.NEXT_PUBLIC_GA_ID || '',
      ad_client_id: process.env.NEXT_PUBLIC_AD_CLIENT_ID || '',
      ads_enabled: true,
      disabled_platforms: [], // e.g. ['vimeo']
      max_input_file_size_mb: 500,
      max_output_file_size_mb: 500,
      processing_timeout_seconds: 300,
      worker_concurrency: 2,
    };

    const value = (defaultValue !== undefined ? defaultValue : defaultsMap[key]) as T;
    this.settingsCache.set(key, { value, updatedAt: Date.now() });
    return value;
  }

  /**
   * Update or insert a setting value.
   */
  public async setSetting<T>(key: string, value: T, adminUser = 'admin'): Promise<boolean> {
    this.settingsCache.set(key, { value, updatedAt: Date.now() });
    return true;
  }

  /**
   * Get all dynamic settings dictionary.
   */
  public async getAllSettings(): Promise<Record<string, any>> {
    const keys = [
      'site_name',
      'site_url',
      'contact_email',
      'maintenance_mode',
      'maintenance_title',
      'maintenance_message',
      'announcement_enabled',
      'announcement_message',
      'announcement_url',
      'default_seo_title',
      'default_seo_description',
      'google_analytics_id',
      'ad_client_id',
      'ads_enabled',
      'disabled_platforms',
      'max_input_file_size_mb',
      'max_output_file_size_mb',
      'processing_timeout_seconds',
      'worker_concurrency',
    ];

    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = await this.getSetting(key, undefined);
    }

    return result;
  }

  /**
   * Invalidate settings memory cache.
   */
  public invalidateCache(): void {
    this.settingsCache.clear();
  }
}

export const settingsService = SettingsService.getInstance();
