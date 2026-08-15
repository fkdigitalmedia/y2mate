# y2matevideo.com - Production-Grade Media Processing & Downloader Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-2.0-green.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

y2matevideo.com is a fast, production-ready, mobile-friendly online media analyzer and converter platform built with **Next.js 14 App Router**, **Tailwind CSS**, **Supabase PostgreSQL**, **Cloudflare R2 Object Storage**, and a dedicated background **Node.js/FFmpeg Worker Pipeline**.

---

## 🌟 Architectural Features

- 🚀 **Asynchronous Worker Architecture**: Heavy FFmpeg video processing and audio extraction run on an isolated worker daemon, avoiding serverless timeout limits.
- ⚡ **Multi-Provider System**: Dynamic media provider registry (`youtube-primary`, `youtube-fallback`, `vimeo`, `tiktok`, `generic-web`) with automatic priority selection.
- 🛡️ **Circuit Breaker Engine**: Automatic failure tracking (`CLOSED` → `OPEN` after 3 failures for 60s cooldown) to protect system resilience.
- 🔒 **Security-First Pipeline**: Strict SSRF IP loopback guards, URL normalization, safe path sanitization, and HMAC-verified webhooks.
- 💰 **Monetization & Usage Control**: Daily free usage caps (20 analyses / 10 downloads per day), anonymous HTTP-only cookie tracking, payment-ready billing provider abstractions, and AdSense placement manager.
- 👤 **Optional Account Infrastructure**: Email/password authentication, protected user control portal (`/account`), subscription portal (`/account/billing`), and public pricing grid (`/pricing`).
- 🎛️ **Full SaaS Admin Panel (`/admin`)**: Complete control center for site settings, SEO defaults, platform toggles, monetization limits, provider priorities, and job diagnostics.

---

## 🛠 Tech Stack

- **Frontend & API**: Next.js 14 (App Router, Server Components, Tailwind CSS, Lucide Icons)
- **Database & RLS**: PostgreSQL (Supabase / Direct Postgres)
- **Object Storage**: Cloudflare R2 / AWS S3 Compatible Vault with 30-minute signed URLs
- **Worker Engine**: Node.js, TSX, FFmpeg, Atomic Job Queue State Machine
- **Testing**: Vitest, TypeScript compiler (`tsc --noEmit`), ESLint

---

## 🚦 Quick Start & Local Setup

### 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Background Processing Worker
In a separate terminal window:
```bash
npm run worker
```

---

## 🧪 Verification & Testing

```bash
# Run TypeScript Type Check (0 errors)
npx tsc --noEmit

# Run ESLint Check (0 warnings/errors)
npm run lint

# Run Vitest Unit Tests (20/20 passing)
npm test

# Run Next.js Production Build (66 routes)
npm run build
```

---

## 📚 Documentation & Runbooks

- [Production Operations Runbook](docs/production-runbook.md)
- [Supported Platform Compliance & Capabilities](docs/supported-platforms.md)

---

## 📄 License & Legal Notice

Distributed under the MIT License. Users must ensure they have authorization before downloading third-party media streams.
