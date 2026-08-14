import { settingsService } from '@/lib/settings/settings-service';

export interface UsageStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}

export interface UserRemainingUsage {
  tier: 'FREE' | 'PREMIUM' | 'ADMIN';
  analysesUsed: number;
  analysesLimit: number;
  analysesRemaining: number;
  downloadsUsed: number;
  downloadsLimit: number;
  downloadsRemaining: number;
}

class UsageLimitService {
  private static instance: UsageLimitService;
  // In-memory usage store (keyed by date string: YYYY-MM-DD + anonId)
  private usageStore = new Map<string, { analyses: number; downloads: number }>();

  public static getInstance(): UsageLimitService {
    if (!UsageLimitService.instance) {
      UsageLimitService.instance = new UsageLimitService();
    }
    return UsageLimitService.instance;
  }

  private getTodayKey(anonId: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `${today}_${anonId}`;
  }

  public async getUserTier(anonId: string): Promise<'FREE' | 'PREMIUM' | 'ADMIN'> {
    // Default tier is FREE
    return 'FREE';
  }

  /**
   * Check if user is permitted to perform a media URL analysis.
   */
  public async canAnalyze(anonId: string): Promise<UsageStatus> {
    const tier = await this.getUserTier(anonId);
    const limit = await settingsService.getSetting(
      tier === 'PREMIUM' ? 'premium_daily_analyses' : 'free_daily_analyses',
      tier === 'PREMIUM' ? 200 : 20
    );

    const key = this.getTodayKey(anonId);
    const current = this.usageStore.get(key) || { analyses: 0, downloads: 0 };
    const remaining = Math.max(0, limit - current.analyses);

    if (current.analyses >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        reason: "You've reached today's free usage limit. Please try again tomorrow.",
      };
    }

    return {
      allowed: true,
      remaining,
      limit,
    };
  }

  /**
   * Check if user is permitted to create a media download job.
   */
  public async canCreateDownload(anonId: string, fileSizeMb?: number): Promise<UsageStatus> {
    const tier = await this.getUserTier(anonId);
    const downloadLimit = await settingsService.getSetting(
      tier === 'PREMIUM' ? 'premium_daily_downloads' : 'free_daily_downloads',
      tier === 'PREMIUM' ? 100 : 10
    );

    const maxFileSizeMb = await settingsService.getSetting(
      tier === 'PREMIUM' ? 'premium_max_file_size_mb' : 'free_max_file_size_mb',
      tier === 'PREMIUM' ? 2048 : 500
    );

    if (fileSizeMb && fileSizeMb > maxFileSizeMb) {
      return {
        allowed: false,
        remaining: 0,
        limit: downloadLimit,
        reason: `This file size (${fileSizeMb} MB) exceeds the current free download limit (${maxFileSizeMb} MB).`,
      };
    }

    const key = this.getTodayKey(anonId);
    const current = this.usageStore.get(key) || { analyses: 0, downloads: 0 };
    const remaining = Math.max(0, downloadLimit - current.downloads);

    if (current.downloads >= downloadLimit) {
      return {
        allowed: false,
        remaining: 0,
        limit: downloadLimit,
        reason: "You've reached today's free download limit. Please try again tomorrow.",
      };
    }

    return {
      allowed: true,
      remaining,
      limit: downloadLimit,
    };
  }

  /**
   * Record usage action (called ONLY upon successful API validation & job creation).
   */
  public async recordUsage(anonId: string, action: 'ANALYZE' | 'DOWNLOAD'): Promise<void> {
    const key = this.getTodayKey(anonId);
    const current = this.usageStore.get(key) || { analyses: 0, downloads: 0 };

    if (action === 'ANALYZE') {
      current.analyses += 1;
    } else if (action === 'DOWNLOAD') {
      current.downloads += 1;
    }

    this.usageStore.set(key, current);
  }

  /**
   * Refund usage attempt if processing fails due to internal infrastructure error.
   */
  public async refundUsage(anonId: string, action: 'DOWNLOAD'): Promise<void> {
    const key = this.getTodayKey(anonId);
    const current = this.usageStore.get(key);
    if (current && current.downloads > 0) {
      current.downloads -= 1;
      this.usageStore.set(key, current);
    }
  }

  /**
   * Get total remaining daily usage summary for UI counter widget.
   */
  public async getRemainingUsage(anonId: string): Promise<UserRemainingUsage> {
    const tier = await this.getUserTier(anonId);
    const analysesLimit = await settingsService.getSetting(
      tier === 'PREMIUM' ? 'premium_daily_analyses' : 'free_daily_analyses',
      tier === 'PREMIUM' ? 200 : 20
    );

    const downloadsLimit = await settingsService.getSetting(
      tier === 'PREMIUM' ? 'premium_daily_downloads' : 'free_daily_downloads',
      tier === 'PREMIUM' ? 100 : 10
    );

    const key = this.getTodayKey(anonId);
    const current = this.usageStore.get(key) || { analyses: 0, downloads: 0 };

    return {
      tier,
      analysesUsed: current.analyses,
      analysesLimit,
      analysesRemaining: Math.max(0, analysesLimit - current.analyses),
      downloadsUsed: current.downloads,
      downloadsLimit,
      downloadsRemaining: Math.max(0, downloadsLimit - current.downloads),
    };
  }
}

export const usageLimitService = UsageLimitService.getInstance();
