import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin/auth';
import { providerRegistry } from '@/lib/media/providers/registry';
import { circuitBreaker } from '@/lib/media/providers/circuit-breaker';

export async function GET(request: Request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const providers = providerRegistry.getAllProviders().map((p) => {
    const health = circuitBreaker.getMetrics(p.id);
    return {
      id: p.id,
      name: p.name,
      platformId: p.platformId,
      domains: p.domains,
      enabled: p.enabled,
      priority: p.priority,
      status: health.status,
      circuitState: health.circuitState,
      successCount: health.successCount,
      failureCount: health.failureCount,
      avgResponseMs: health.avgResponseMs,
      lastSuccess: health.lastSuccess || 'N/A',
      lastFailure: health.lastFailure || 'N/A',
    };
  });

  return NextResponse.json({ success: true, providers });
}

export async function POST(request: Request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { providerId, enabled, priority } = body;

    const provider = providerRegistry.getProvider(providerId);
    if (!provider) {
      return NextResponse.json({ success: false, error: 'Provider not found.' }, { status: 404 });
    }

    if (typeof enabled === 'boolean') {
      provider.enabled = enabled;
    }
    if (typeof priority === 'number') {
      provider.priority = priority;
    }

    return NextResponse.json({
      success: true,
      message: `Provider ${providerId} settings updated successfully.`,
      provider: {
        id: provider.id,
        enabled: provider.enabled,
        priority: provider.priority,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to update provider.' }, { status: 500 });
  }
}
