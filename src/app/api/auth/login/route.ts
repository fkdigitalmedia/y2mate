import { NextResponse } from 'next/server';
import { createUserSessionToken, setUserAuthCookie, userDatabaseInMemory } from '@/lib/auth/user-auth';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate limit: 5 login attempts / 15 mins / IP
    const rateLimit = checkRateLimit(`user_login_${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please wait 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Invalid login credentials.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userRecord = userDatabaseInMemory.get(normalizedEmail);

    if (!userRecord || userRecord.passwordHash !== String(password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' }, // Generic error message (Section 4)
        { status: 401 }
      );
    }

    // Set session cookie
    const token = createUserSessionToken(userRecord);
    setUserAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userRecord.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Authentication error occurred.' },
      { status: 500 }
    );
  }
}
