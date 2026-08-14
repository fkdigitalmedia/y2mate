import { NextResponse } from 'next/server';
import { billingProvider } from '@/lib/billing/billing-provider';

export async function POST(
  request: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const signature = request.headers.get('x-signature') || request.headers.get('stripe-signature') || '';
    const rawBody = await request.text();

    const isValidSignature = billingProvider.verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing webhook signature.' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody || '{}');
    const eventType = payload.event_name || payload.type || 'subscription.created';

    console.log(`[BILLING_WEBHOOK] Received ${params.provider} event: ${eventType}`);

    return NextResponse.json({
      success: true,
      received: true,
      provider: params.provider,
      eventType,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Webhook processing error.' },
      { status: 400 }
    );
  }
}
