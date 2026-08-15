import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  email: string;
  displayName?: string;
  role: 'USER' | 'ADMIN';
  createdAt: number;
}

const USER_SESSION_COOKIE = 'y2matevideo_user_session';
const USER_SECRET_KEY = process.env.USER_SESSION_SECRET || 'y2matevideo-user-session-secret-key-2026';

/**
 * Creates a signed user session token.
 */
export function createUserSessionToken(user: { id: string; email: string; displayName?: string; role?: 'USER' | 'ADMIN' }): string {
  const session: UserSession = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role || 'USER',
    createdAt: Date.now(),
  };

  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = Buffer.from(`${payload}.${USER_SECRET_KEY}`).toString('base64url').substring(0, 16);
  return `${payload}.${signature}`;
}

/**
 * Validates session token and returns UserSession if valid.
 */
export function validateUserSessionToken(token?: string | null): UserSession | null {
  if (!token || !token.includes('.')) return null;

  try {
    const [payload, signature] = token.split('.');
    const expectedSig = Buffer.from(`${payload}.${USER_SECRET_KEY}`).toString('base64url').substring(0, 16);

    if (signature !== expectedSig) {
      return null;
    }

    const session: UserSession = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

    // 30-day session expiration
    if (Date.now() - session.createdAt > 30 * 24 * 60 * 60 * 1000) {
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
export function verifyUserSession(request?: Request): UserSession | null {
  let token: string | undefined;

  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(USER_SESSION_COOKIE)?.value;
    } catch {
      // Suppress cookie store error in static build
    }
  }

  return validateUserSessionToken(token);
}

export function setUserAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
}

export function clearUserAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
}

// In-memory User store fallback for local development
export const userDatabaseInMemory = new Map<string, { id: string; email: string; passwordHash: string; displayName?: string; role: 'USER' | 'ADMIN' }>();

// Seed initial test account
userDatabaseInMemory.set('user@y2matevideo.com', {
  id: 'usr_test_01',
  email: 'user@y2matevideo.com',
  passwordHash: 'userpassword123',
  displayName: 'y2matevideo Member',
  role: 'USER',
});
