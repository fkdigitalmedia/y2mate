export interface CheckoutOptions {
  planId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionDetails {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'TRIALING';
  plan: string;
  currentPeriodEnd: string;
}

export interface IBillingProvider {
  name: string;
  createCheckout(options: CheckoutOptions): Promise<{ url?: string; disabledMessage?: string }>;
  getSubscription(subscriptionId: string): Promise<SubscriptionDetails | null>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}

/**
 * Abstract Payment Billing Provider (Lemon Squeezy / Stripe / Custom)
 */
export class BillingProviderManager implements IBillingProvider {
  public name = 'AbstractBillingProvider';

  public async createCheckout(options: CheckoutOptions): Promise<{ url?: string; disabledMessage?: string }> {
    const isBillingConfigured = Boolean(process.env.BILLING_API_KEY);

    if (!isBillingConfigured) {
      return {
        disabledMessage: 'Premium upgrades coming soon! Payment provider currently unconfigured.',
      };
    }

    return { url: `${options.successUrl}?checkout=pending` };
  }

  public async getSubscription(subscriptionId: string): Promise<SubscriptionDetails | null> {
    return null;
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }

  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.BILLING_WEBHOOK_SECRET;
    if (!secret) return false;
    return signature === secret;
  }
}

export const billingProvider = new BillingProviderManager();
