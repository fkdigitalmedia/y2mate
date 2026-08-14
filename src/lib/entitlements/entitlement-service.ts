import { settingsService } from '@/lib/settings/settings-service';

export class EntitlementService {
  private static instance: EntitlementService;

  public static getInstance(): EntitlementService {
    if (!EntitlementService.instance) {
      EntitlementService.instance = new EntitlementService();
    }
    return EntitlementService.instance;
  }

  public async isPremium(userOrAnonId: string): Promise<boolean> {
    const premiumEnabled = await settingsService.getSetting('premium_enabled', false);
    if (!premiumEnabled) return false;

    // Default entitlement check
    return false;
  }

  public async getQueuePriority(userOrAnonId: string): Promise<number> {
    const isPrem = await this.isPremium(userOrAnonId);
    if (isPrem) {
      return (await settingsService.getSetting('premium_priority', 100)) as number;
    }
    return 10; // Default FREE queue priority
  }

  public async shouldHideAds(userOrAnonId: string): Promise<boolean> {
    const isPrem = await this.isPremium(userOrAnonId);
    if (!isPrem) return false;
    return (await settingsService.getSetting('premium_ads_removed', true)) as boolean;
  }
}

export const entitlementService = EntitlementService.getInstance();
