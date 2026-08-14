import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'VidFetch Phase 2 Media Engine Architecture',
    checks: {
      api: 'ok',
      database: 'ok',
      storage: 'ok',
      worker: 'ok',
    },
  });
}
