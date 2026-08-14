import { NextResponse } from 'next/server';
import { verifyUserSession } from '@/lib/auth/user-auth';
import { entitlementService } from '@/lib/entitlements/entitlement-service';

export async function GET(request: Request) {
  const session = verifyUserSession(request);

  if (!session) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      user: null,
    });
  }

  const isPremium = await entitlementService.isPremium(session.id);

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      id: session.id,
      email: session.email,
      displayName: session.displayName,
      role: session.role,
      isPremium,
    },
  });
}
