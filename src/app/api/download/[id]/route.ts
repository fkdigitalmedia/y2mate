import { NextResponse } from 'next/server';
import { downloadJobManager } from '@/lib/media/job-manager';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;
  const job = await downloadJobManager.getJob(jobId);

  if (!job) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'JOB_EXPIRED',
          message: 'Download job not found or expired.',
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      mediaId: job.mediaId,
      platform: job.platform,
      format: job.format,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      downloadUrl: job.downloadUrl,
      fileName: job.fileName,
      fileSize: job.fileSize,
      mimeType: job.mimeType,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      expiresAt: job.expiresAt,
    },
  });
}
