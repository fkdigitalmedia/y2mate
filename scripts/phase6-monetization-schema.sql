-- VidFetch Phase 6 Database Schema Migration (Supabase PostgreSQL / Direct Postgres)

-- 1. Anonymous / User Usage Records Table
CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  anon_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('ANALYZE', 'DOWNLOAD')),
  quantity INT NOT NULL DEFAULT 1,
  tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PREMIUM', 'ADMIN')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Subscriptions Data Model (Payment-Ready)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'TRIALING')),
  plan TEXT NOT NULL DEFAULT 'PREMIUM_MONTHLY',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Billing Webhooks Log Table (Idempotency & Event Auditing)
CREATE TABLE IF NOT EXISTS billing_webhooks (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (status IN ('PROCESSED', 'FAILED', 'IGNORED')),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Abuse Tracking Logs Table
CREATE TABLE IF NOT EXISTS abuse_logs (
  id TEXT PRIMARY KEY,
  anon_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  score INT NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Fast Usage & Limit Checks
CREATE INDEX IF NOT EXISTS idx_usage_records_anon ON usage_records(anon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_webhooks_event ON billing_webhooks(event_type, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_logs_anon ON abuse_logs(anon_id, created_at DESC);

-- Enable Supabase Row Level Security (RLS)
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_logs ENABLE ROW LEVEL SECURITY;
