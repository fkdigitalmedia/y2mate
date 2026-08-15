-- VidFetch Phase 5 Database Schema Migration (Supabase PostgreSQL / Direct Postgres)

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Centralized Key-Value Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- 3. Worker Heartbeats Table
CREATE TABLE IF NOT EXISTS worker_heartbeats (
  worker_id TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'BUSY')),
  version TEXT,
  metadata JSONB
);

-- 4. Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. System Errors Table
CREATE TABLE IF NOT EXISTS system_errors (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  error_code TEXT NOT NULL,
  message TEXT NOT NULL,
  job_id TEXT,
  platform TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Admin Dashboard Queries
CREATE INDEX IF NOT EXISTS idx_site_settings_updated ON site_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_worker_heartbeats_seen ON worker_heartbeats(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON admin_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_timestamp ON system_errors(timestamp DESC);

-- Enable Supabase Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_errors ENABLE ROW LEVEL SECURITY;

-- Default Admin User Seed (email: admin@y2matevideo.com, password: adminpassword)
INSERT INTO admin_users (id, email, password_hash, role)
VALUES (
  'admin_01',
  'admin@y2matevideo.com',
  '$2a$10$7v2L5bM1L3x4c5v6b7n8mO1P2Q3R4S5T6U7V8W9X0Y1Z2a3b4c5d6e',
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;
