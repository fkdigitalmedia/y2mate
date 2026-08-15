import { NextResponse } from 'next/server';
import { createAdminSessionToken, setAdminSessionCookie } from '@/lib/admin/auth';
import { logAdminAction } from '@/lib/admin/audit';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate Limit: 5 login attempts / 15 minutes / IP to prevent brute-force
    const rateLimit = checkRateLimit(`admin_login_${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please wait 15 minutes before trying again.',
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid login credentials.',
        },
        { status: 400 }
      );
    }

    // Default admin credentials check (or Supabase Auth verification)
    const expectedAdminEmail = process.env.ADMIN_EMAIL || 'admin@y2matevideo.com';
    const expectedAdminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';

    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedEmail !== expectedAdminEmail.toLowerCase() || String(password) !== expectedAdminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid login credentials.', // Generic error message (Section 43)
        },
        { status: 401 }
      );
    }

    // Create session token and set HTTP-Only cookie
    const adminUser = { id: 'admin_01', email: normalizedEmail };
    const token = createAdminSessionToken(adminUser);
    setAdminSessionCookie(token);

    await logAdminAction(adminUser.id, 'ADMIN_LOGIN', 'auth', undefined, { ip });

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: 'ADMIN',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'An internal authentication error occurred.',
      },
      { status: 500 }
    );
  }
}
