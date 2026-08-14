import { cookies } from 'next/headers';

const ANON_COOKIE_NAME = 'y2mate_anon_id';

/**
 * Retrieves existing anonymous user ID or generates a new secure random identifier.
 */
export function getOrCreateAnonymousId(): string {
  try {
    const cookieStore = cookies();
    let anonId = cookieStore.get(ANON_COOKIE_NAME)?.value;

    if (!anonId) {
      anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      cookieStore.set(ANON_COOKIE_NAME, anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year retention
        path: '/',
      });
    }

    return anonId;
  } catch {
    // Fallback for non-cookie contexts
    return `anon_guest_${Date.now()}`;
  }
}
