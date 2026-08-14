import { NextResponse } from 'next/server';
import { mediaAnalyzer } from '@/lib/media/analyzer';
import { verifyFormatBelongsToMedia } from '@/lib/media/formats';
import { downloadJobManager } from '@/lib/media/job-manager';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getOrCreateAnonymousId } from '@/lib/security/anonymous-id';
import { usageLimitService } from '@/lib/usage/usage-limit-service';
import { toSafeUserError } from '@/lib/media/errors';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const anonId = getOrCreateAnonymousId();

    // Step 1: Rate Limit Guard (Infrastructure Protection: max 5 requests/min)
    const rateLimit = checkRateLimit(`download_${ip}`, { limit: 5, windowMs: 60 * 1000 });
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

    // Step 2: Usage Limit Guard (Product Usage Control: e.g. 10 downloads/day)
    const usageStatus = await usageLimitService.canCreateDownload(anonId);
    if (!usageStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USAGE_LIMIT_EXCEEDED',
            message: usageStatus.reason || "You've reached today's free download limit.",
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { mediaId, formatId, url } = body;

    if (!formatId || (!mediaId && !url)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Missing required parameters: formatId and mediaId/url.',
          },
        },
        { status: 400 }
      );
    }

    // Step 3: Resolve MediaResult from cache or URL re-analysis
    let media = mediaAnalyzer.getCachedMedia(mediaId || url);
    if (!media && url) {
      media = await mediaAnalyzer.analyze(url);
    }

    if (!media) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Media session expired or not found. Please re-analyze the URL.',
          },
        },
        { status: 404 }
      );
    }

    // Step 4: Strict Format Verification
    const verifiedFormat = verifyFormatBelongsToMedia(media, formatId);

    // Step 5: Create Download Processing Job
    const job = await downloadJobManager.createJob(media, verifiedFormat);

    // Step 6: Record Usage Only Upon Successful Job Creation
    await usageLimitService.recordUsage(anonId, 'DOWNLOAD');

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      stage: job.stage,
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
