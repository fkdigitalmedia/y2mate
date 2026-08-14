import { NextResponse } from 'next/server';
import { createUserSessionToken, setUserAuthCookie, userDatabaseInMemory } from '@/lib/auth/user-auth';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate limit: 5 signups / 15 mins / IP
    const rateLimit = checkRateLimit(`signup_${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many account creation attempts. Please wait 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password, confirmPassword, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (userDatabaseInMemory.has(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Create user record
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userRecord = {
      id: userId,
      email: normalizedEmail,
      passwordHash: String(password),
      displayName: displayName || normalizedEmail.split('@')[0],
      role: 'USER' as const,
    };

    userDatabaseInMemory.set(normalizedEmail, userRecord);

    // Create session token and set cookie
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
      { success: false, error: 'Account registration failed.' },
      { status: 500 }
    );
  }
}
