import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin/auth';
import { getRecentAuditLogs } from '@/lib/admin/audit';

export async function GET(request: Request) {
  const session = verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '7d';

  // Aggregate metrics (mock / live database fallback metrics)
  const metrics = {
    totalAnalyses: 1420,
    successfulAnalyses: 1395,
    downloadJobs: 840,
    completedDownloads: 812,
    failedJobs: 28,
    activeJobs: 2,
    activeWorkers: 1,
    workerHeartbeat: {
      status: 'ONLINE',
      workerId: 'worker_node_01',
      lastSeen: new Date().toISOString(),
    },
  };

  const recentJobs = [
    { id: 'job_8c92a10f_17867', platform: 'YouTube', format: '1080p MP4', status: 'COMPLETED', created: '2 mins ago', duration: '12s' },
    { id: 'job_4b18c99e_17866', platform: 'Vimeo', format: '720p MP4', status: 'COMPLETED', created: '15 mins ago', duration: '8s' },
    { id: 'job_1a23f45d_17865', platform: 'TikTok', format: '320kbps MP3', status: 'COMPLETED', created: '34 mins ago', duration: '5s' },
    { id: 'job_9e87d65c_17864', platform: 'YouTube', format: '480p MP4', status: 'FAILED', created: '1 hour ago', duration: '30s', error: 'FFmpeg process timeout' },
  ];

  const recentErrors = [
    { id: 'err_101', service: 'Worker', code: 'PROCESSING_TIMEOUT', platform: 'YouTube', message: 'FFmpeg processing exceeded 300s limit.', timestamp: '1 hour ago' },
  ];

  const auditLogs = await getRecentAuditLogs(10);

  return NextResponse.json({
    success: true,
    timeframe,
    metrics,
    recentJobs,
    recentErrors,
    auditLogs,
  });
}
