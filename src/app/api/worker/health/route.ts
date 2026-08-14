import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.WORKER_SECRET || 'dev-worker-secret-change-in-prod';

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized worker API request.',
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    workerSecretValid: true,
  });
}
