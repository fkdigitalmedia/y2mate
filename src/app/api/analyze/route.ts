import { NextResponse } from 'next/server';
import { mediaAnalyzer } from '@/lib/media/analyzer';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getOrCreateAnonymousId } from '@/lib/security/anonymous-id';
import { usageLimitService } from '@/lib/usage/usage-limit-service';
import { toSafeUserError } from '@/lib/media/errors';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const anonId = getOrCreateAnonymousId();

    // Step 1: Rate Limit Guard (Infrastructure Protection: max 10 requests/min)
    const rateLimit = checkRateLimit(`analyze_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please wait a moment.',
          },
        },
        { status: 429 }
      );
    }

    // Step 2: Usage Limit Guard (Product Usage Control: e.g. 20 analyses/day)
    const usageStatus = await usageLimitService.canAnalyze(anonId);
    if (!usageStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USAGE_LIMIT_EXCEEDED',
            message: usageStatus.reason || "You've reached today's free usage limit. Please try again tomorrow.",
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Please enter a valid video URL.',
          },
        },
        { status: 400 }
      );
    }

    // Step 3: Execute Media Analysis
    const result = await mediaAnalyzer.analyze(url);

    // Step 4: Record Usage Only Upon Successful Analysis
    await usageLimitService.recordUsage(anonId, 'ANALYZE');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const safeError = toSafeUserError(err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: safeError.code,
          message: safeError.message,
        },
      },
      { status: safeError.statusCode }
    );
  }
}
