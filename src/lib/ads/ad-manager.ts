import { settingsService } from '@/lib/settings/settings-service';
import { entitlementService } from '@/lib/entitlements/entitlement-service';

export type AdPlacement =
  | 'HOME_TOP'
  | 'HOME_BOTTOM'
  | 'RESULT_TOP'
  | 'RESULT_BOTTOM'
  | 'CONTENT_INLINE'
  | 'FOOTER';

export class AdManager {
  private static instance: AdManager;

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  public async shouldRenderAd(placement: AdPlacement, userOrAnonId = 'anon'): Promise<boolean> {
    const adsEnabled = await settingsService.getSetting('ads_enabled', true);
    if (!adsEnabled) return false;

    const hideForPremium = await entitlementService.shouldHideAds(userOrAnonId);
    if (hideForPremium) return false;

    // Check individual placement enablement
    const placementSetting = await settingsService.getSetting(`ad_placement_${placement.toLowerCase()}`, true);
    return placementSetting;
  }
}

export const adManager = AdManager.getInstance();
