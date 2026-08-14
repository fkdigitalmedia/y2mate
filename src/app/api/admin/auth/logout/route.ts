import { NextResponse } from 'next/server';
import { clearAdminSessionCookie, verifyAdminAuth } from '@/lib/admin/auth';
import { logAdminAction } from '@/lib/admin/audit';

export async function POST(request: Request) {
  const session = verifyAdminAuth(request);
  if (session) {
    await logAdminAction(session.id, 'ADMIN_LOGOUT', 'auth');
  }

  clearAdminSessionCookie();

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });
}
