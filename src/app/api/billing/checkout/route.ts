import { NextResponse } from 'next/server';
import { verifyUserSession } from '@/lib/auth/user-auth';
import { billingProvider } from '@/lib/billing/billing-provider';
import { siteConfig } from '@/config/site';

export async function POST(request: Request) {
  try {
    const session = verifyUserSession(request);
    const userId = session?.id || 'anon_user';

    const body = await request.json().catch(() => ({}));
    const { planSlug } = body;

    // Server-side plan resolution (NEVER accept price directly from browser payload)
    const activePlan = {
      id: 'plan_premium_monthly',
      name: 'y2mate Premium',
      slug: 'premium-monthly',
      price: 9.99,
      currency: 'USD',
    };

    const origin = request.headers.get('origin') || siteConfig.url;
    const successUrl = `${origin}/billing/success`;
    const cancelUrl = `${origin}/billing/cancelled`;

    const checkout = await billingProvider.createCheckout({
      planId: activePlan.id,
      userId,
      successUrl,
      cancelUrl,
    });

    if (checkout.disabledMessage) {
      return NextResponse.json({
        success: false,
        disabledMessage: checkout.disabledMessage,
      });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Checkout session creation failed.' },
      { status: 500 }
    );
  }
}
