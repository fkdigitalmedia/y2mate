import { NextResponse } from 'next/server';
import { clearUserAuthCookie } from '@/lib/auth/user-auth';

export async function POST() {
  clearUserAuthCookie();
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });
}
