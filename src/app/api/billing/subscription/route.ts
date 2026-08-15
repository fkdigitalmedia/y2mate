import { NextResponse } from 'next/server';
import { verifyUserSession } from '@/lib/auth/user-auth';
import { entitlementService } from '@/lib/entitlements/entitlement-service';

export async function GET(request: Request) {
  const session = verifyUserSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const isPremium = await entitlementService.isPremium(session.id);

  const subscription = {
    planName: isPremium ? 'y2matevideo Premium' : 'Free Tier',
    status: isPremium ? 'ACTIVE' : 'INACTIVE',
    price: isPremium ? '$9.99 / month' : 'Free',
    nextBillingDate: isPremium ? 'September 14, 2026' : 'N/A',
    cancelAtPeriodEnd: false,
  };

  return NextResponse.json({ success: true, subscription });
}

export async function POST(request: Request) {
  const session = verifyUserSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'cancel') {
      return NextResponse.json({
        success: true,
        message: 'Your Premium subscription will remain active until the end of the current billing period.',
        cancelAtPeriodEnd: true,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid subscription action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to process subscription update.' }, { status: 500 });
  }
}
