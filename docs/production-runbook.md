# y2matevideo.com Production Operations Runbook

This document provides operational guidelines for deploying, operating, maintaining, and troubleshooting y2matevideo.com in a production environment.

---

## 1. System Infrastructure Overview

```
                         ┌─────────────────────────────┐
                         │   Vercel Next.js App Router  │
                         │   (Frontend & Edge API)     │
                         └──────────────┬──────────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
                 ▼                      ▼                      ▼
      ┌────────────────────┐  ┌──────────────────┐   ┌────────────────────┐
      │ Supabase Postgres  │  │ Cloudflare R2    │   │ Worker Nodes (VPS) │
      │ (DB, RLS, Auth)    │  │ (Signed Storage) │   │ (FFmpeg Engine)    │
      └────────────────────┘  └──────────────────┘   └────────────────────┘
```

---

## 2. Production Deployment Steps

### A. Database Setup (Supabase PostgreSQL)
1. Log in to [Supabase Console](https://supabase.com).
2. Create a new PostgreSQL database project.
3. Open SQL Editor and execute the migration scripts in sequential order:
   - `scripts/schema.sql` (Base schema)
   - `scripts/phase5-admin-schema.sql` (Admin panel & audit logs)
   - `scripts/phase6-monetization-schema.sql` (Usage records & billing)
   - `scripts/phase7-billing-schema.sql` (User profiles & plans)
   - `scripts/phase8-providers-schema.sql` (Provider configs & health metrics)
4. Verify RLS policies are enabled on all tables.

### B. Storage Setup (Cloudflare R2)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) -> R2 Object Storage.
2. Create bucket: `y2matevideo-temp-media`.
3. Set Lifecycle Policy: **Delete objects after 1 day** (automatic storage purge).
4. Generate API Tokens with `Object Read & Write` permissions.
5. Record `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, and `STORAGE_ENDPOINT`.

### C. Frontend & Edge API Deployment (Vercel)
1. Connect GitHub repository to Vercel.
2. Set Framework Preset: **Next.js**.
3. Add Environment Variables in Vercel Dashboard (see `.env.example`):
   - `NEXT_PUBLIC_SITE_URL`
   - `DATABASE_URL`
   - `STORAGE_PROVIDER`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`
   - `USER_SESSION_SECRET`, `ADMIN_SESSION_SECRET`
   - `BILLING_PROVIDER`, `BILLING_WEBHOOK_SECRET`
4. Trigger production build (`npm run build`).

### D. Worker Node Deployment (VPS / Docker Container)
1. Provision Ubuntu 22.04 LTS VPS or Docker Container instance.
2. Install Node.js 20+ and FFmpeg:
   ```bash
   sudo apt-get update
   sudo apt-get install -y ffmpeg nodejs npm
   ```
3. Clone repository and install production dependencies:
   ```bash
   npm ci --production
   ```
4. Start worker process via PM2 daemon:
   ```bash
   npm install -g pm2
   pm2 start worker/src/index.ts --name "y2matevideo-worker-01" --interpreter npx -- tsx
   pm2 save
   ```

---

## 3. Operations & Maintenance Procedures

### Enabling Scheduled Maintenance Mode
1. Log in to `/admin/settings`.
2. Toggle **Maintenance Mode** to **ON**.
3. Public users receive HTTP 503 Maintenance Notice; admin portal remains accessible.

### Emergency Secret Rotation
1. **Database Credentials**: Update `DATABASE_URL` in Vercel and Worker PM2 config, then restart worker (`pm2 restart y2matevideo-worker-01`).
2. **Admin / User Session Secrets**: Update `USER_SESSION_SECRET` / `ADMIN_SESSION_SECRET` in Vercel. Existing sessions will be invalidated safely.
3. **Billing Webhook Secrets**: Update `BILLING_WEBHOOK_SECRET` in provider dashboard (Lemon Squeezy / Stripe) and Vercel simultaneously.

### Stuck Job & Queue Recovery
If worker crashes during download:
1. Log in to `/admin/jobs`.
2. Inspect stuck job timeline (`/admin/jobs/[id]`).
3. Click **Clear Stuck Lease** or trigger manual safe retry.
4. Restart worker daemon:
   ```bash
   pm2 restart y2matevideo-worker-01
   ```

---

## 4. Emergency Outage Response Checklist

| Incident | Severity | Action |
|---|---|---|
| **Worker Node Offline** | P1 Critical | Check PM2 status (`pm2 status`), review `logs/`, restart process, verify worker heartbeat in `/admin/system`. |
| **High Provider Failures** | P1 Critical | Check `/admin/providers`. Verify circuit breaker state (`OPEN`). Enable secondary fallback provider adapter or adjust priority. |
| **Billing Webhook Spike Failure** | P2 High | Inspect `/admin/monetization` webhook logs. Verify HMAC secret matching and provider API connectivity. |
| **Storage Capacity Cap** | P2 High | Run lifecycle cleanup cycle or verify Cloudflare R2 object expiration rule. |
