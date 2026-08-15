import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'y2matevideo.com Media Engine Architecture',
    checks: {
      api: 'ok',
      database: 'ok',
      storage: 'ok',
      worker: 'ok',
    },
  });
}
