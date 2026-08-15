import { cookies } from 'next/headers';

export interface AdminUserSession {
  id: string;
  email: string;
  role: 'ADMIN';
  createdAt: number;
}

const ADMIN_SESSION_COOKIE = 'y2matevideo_admin_session';
const ADMIN_SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'y2matevideo-admin-secret-session-key-2026';

/**
 * Creates a signed admin session token.
 */
export function createAdminSessionToken(user: { id: string; email: string }): string {
  const session: AdminUserSession = {
    id: user.id,
    email: user.email,
    role: 'ADMIN',
    createdAt: Date.now(),
  };

  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  // Simple HMAC-like signature for session verification
  const signature = Buffer.from(`${payload}.${ADMIN_SECRET_KEY}`).toString('base64url').substring(0, 16);
  return `${payload}.${signature}`;
}

/**
 * Validates session token and returns AdminUserSession if valid.
 */
export function validateAdminSessionToken(token?: string | null): AdminUserSession | null {
  if (!token || !token.includes('.')) return null;

  try {
    const [payload, signature] = token.split('.');
    const expectedSig = Buffer.from(`${payload}.${ADMIN_SECRET_KEY}`).toString('base64url').substring(0, 16);

    if (signature !== expectedSig) {
      return null;
    }

    const session: AdminUserSession = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

    // 24 hour session expiration
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Server-side Request authorization guard for API routes & Server Components.
 */
export function verifyAdminAuth(request?: Request): AdminUserSession | null {
  let token: string | undefined;

  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    const cookieStore = cookies();
    token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  }

  return validateAdminSessionToken(token);
}

export function setAdminSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

export function clearAdminSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
