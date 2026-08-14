-- VidFetch Phase 7 Database Schema Migration (Supabase PostgreSQL / Direct Postgres)

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Plans Configuration Table
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly', 'one_time')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Billing Events Log Table (Strict Idempotency & Webhook Auditing)
CREATE TABLE IF NOT EXISTS billing_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT TRUE,
  payload_hash TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Billing Customers Table
CREATE TABLE IF NOT EXISTS billing_customers (
  user_id TEXT PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Plans (Free & Premium Monthly)
INSERT INTO plans (id, name, slug, description, price, currency, billing_interval, active, features, limits)
VALUES (
  'plan_free',
  'Free Tier',
  'free',
  'Standard anonymous downloading with daily limits and ads.',
  0.00,
  'USD',
  'monthly',
  TRUE,
  '["20 Daily Analyses", "10 Daily Downloads", "500MB Max File Size", "Standard Priority Queue", "Ad-supported"]'::jsonb,
  '{"daily_analyses": 20, "daily_downloads": 10, "max_file_size_mb": 500, "priority": 10, "ads": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO plans (id, name, slug, description, price, currency, billing_interval, active, features, limits)
VALUES (
  'plan_premium_monthly',
  'VidFetch Premium',
  'premium-monthly',
  'High-speed priority downloading with expanded limits and zero ads.',
  9.99,
  'USD',
  'monthly',
  TRUE,
  '["200 Daily Analyses", "100 Daily Downloads", "2GB Max File Size", "High Priority Queue (10x Faster)", "100% Ad-Free Experience", "Priority Support"]'::jsonb,
  '{"daily_analyses": 200, "daily_downloads": 100, "max_file_size_mb": 2048, "priority": 100, "ads": false}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_id ON billing_events(provider, event_id);

-- Enable Supabase Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
