import { NextResponse } from 'next/server';
import { resolveFFmpegExecutable } from '@worker/config';
import { spawnSync } from 'child_process';

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

  const ffmpegPath = resolveFFmpegExecutable();
  let ffmpegAvailable = false;
  let ffmpegVersion = 'unknown';

  try {
    const res = spawnSync(ffmpegPath, ['-version'], { windowsHide: true });
    if (res.status === 0) {
      ffmpegAvailable = true;
      const stdout = res.stdout ? res.stdout.toString() : '';
      const match = stdout.match(/ffmpeg version ([^\s]+)/i);
      ffmpegVersion = match ? match[1] : 'installed';
    }
  } catch {}

  return NextResponse.json({
    success: true,
    status: ffmpegAvailable ? 'ONLINE' : 'UNHEALTHY',
    timestamp: new Date().toISOString(),
    workerSecretValid: true,
    ffmpeg: {
      available: ffmpegAvailable,
      version: ffmpegVersion,
    },
  });
}
