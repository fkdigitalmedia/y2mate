-- VidFetch Phase 3 Database Schema (Supabase PostgreSQL / Direct Postgres)

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL,
  media_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  format JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED')),
  stage TEXT NOT NULL DEFAULT 'QUEUED' CHECK (stage IN ('QUEUED', 'DOWNLOADING', 'PROCESSING', 'UPLOADING', 'COMPLETED', 'FAILED')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  download_url TEXT,
  file_key TEXT,
  file_size TEXT,
  mime_type TEXT,
  error_code TEXT,
  error_message TEXT,
  claimed_by TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_claimed_by ON jobs(claimed_by);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Atomic Job Claiming Stored Procedure to prevent race conditions across multiple workers
CREATE OR REPLACE FUNCTION claim_next_job(p_worker_id TEXT, p_lease_seconds INT DEFAULT 300)
RETURNS TABLE (
  id TEXT,
  media_id TEXT,
  media_url TEXT,
  platform TEXT,
  format JSONB,
  status TEXT,
  stage TEXT,
  progress INT,
  download_url TEXT,
  file_key TEXT,
  file_size TEXT,
  mime_type TEXT,
  error_code TEXT,
  error_message TEXT,
  claimed_by TEXT,
  retry_count INT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_job_id TEXT;
BEGIN
  -- Select candidate job (QUEUED or stale PROCESSING with crashed worker)
  SELECT j.id INTO v_job_id
  FROM jobs j
  WHERE j.status = 'QUEUED'
     OR (j.status = 'PROCESSING' AND j.updated_at < NOW() - (p_lease_seconds || ' seconds')::INTERVAL)
  ORDER BY j.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job_id IS NOT NULL THEN
    RETURN QUERY
    UPDATE jobs
    SET 
      status = 'PROCESSING',
      stage = 'DOWNLOADING',
      progress = 10,
      claimed_by = p_worker_id,
      started_at = COALESCE(jobs.started_at, NOW()),
      updated_at = NOW()
    WHERE jobs.id = v_job_id
    RETURNING 
      jobs.id,
      jobs.media_id,
      jobs.media_url,
      jobs.platform,
      jobs.format,
      jobs.status,
      jobs.stage,
      jobs.progress,
      jobs.download_url,
      jobs.file_key,
      jobs.file_size,
      jobs.mime_type,
      jobs.error_code,
      jobs.error_message,
      jobs.claimed_by,
      jobs.retry_count,
      jobs.started_at,
      jobs.completed_at,
      jobs.failed_at,
      jobs.expires_at,
      jobs.created_at,
      jobs.updated_at;
  END IF;
END;
$$ LANGUAGE plpgsql;
