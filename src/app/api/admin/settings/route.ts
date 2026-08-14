import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin/auth';
import { settingsService } from '@/lib/settings/settings-service';
import { logAdminAction } from '@/lib/admin/audit';

export async function GET(request: Request) {
  const session = verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const settings = await settingsService.getAllSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(request: Request) {
  const session = verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Setting key is required.' }, { status: 400 });
    }

    await settingsService.setSetting(key, value, session.email);
    await logAdminAction(session.id, 'ADMIN_CHANGED_SETTING', 'settings', key, { value });

    return NextResponse.json({ success: true, key, value });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update setting.' }, { status: 500 });
  }
}
