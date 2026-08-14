import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin/auth';
import { downloadJobManager } from '@/lib/media/job-manager';

export async function GET(request: Request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const activeJobs = downloadJobManager.getRecentJobs();

  return NextResponse.json({
    success: true,
    totalJobs: activeJobs.length,
    jobs: activeJobs,
  });
}
