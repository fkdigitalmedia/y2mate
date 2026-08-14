import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin/auth';
import { settingsService } from '@/lib/settings/settings-service';
import { logAdminAction } from '@/lib/admin/audit';
import { siteConfig } from '@/config/site';

export async function GET(request: Request) {
  const session = verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const disabledPlatforms = await settingsService.getSetting<string[]>('disabled_platforms', []);
  const platforms = siteConfig.supportedPlatforms.map((p) => ({
    ...p,
    enabled: !disabledPlatforms.includes(p.id),
  }));

  return NextResponse.json({ success: true, platforms });
}

export async function POST(request: Request) {
  const session = verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { platformId, enabled } = body;

    if (!platformId) {
      return NextResponse.json({ success: false, error: 'Platform ID is required.' }, { status: 400 });
    }

    let disabledPlatforms = await settingsService.getSetting<string[]>('disabled_platforms', []);

    if (enabled) {
      disabledPlatforms = disabledPlatforms.filter((id) => id !== platformId);
    } else {
      if (!disabledPlatforms.includes(platformId)) {
        disabledPlatforms.push(platformId);
      }
    }

    await settingsService.setSetting('disabled_platforms', disabledPlatforms, session.email);
    await logAdminAction(session.id, enabled ? 'ADMIN_ENABLED_PLATFORM' : 'ADMIN_DISABLED_PLATFORM', 'platform', platformId);

    return NextResponse.json({ success: true, platformId, enabled });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
