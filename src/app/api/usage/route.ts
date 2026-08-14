import { NextResponse } from 'next/server';
import { getOrCreateAnonymousId } from '@/lib/security/anonymous-id';
import { usageLimitService } from '@/lib/usage/usage-limit-service';

export async function GET() {
  try {
    const anonId = getOrCreateAnonymousId();
    const usage = await usageLimitService.getRemainingUsage(anonId);

    return NextResponse.json({
      success: true,
      usage,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve usage stats.' },
      { status: 500 }
    );
  }
}
