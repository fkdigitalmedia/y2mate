'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug: 'premium-monthly' }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setNotice(json.disabledMessage || json.error || 'Upgrade failed. Please try again.');
        return;
      }

      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      }
    } catch {
      setNotice('Network error during checkout initialization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
          PRO UNLIMITED UTILITY
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Simple & Fair Pricing
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Start for free with zero registration, or upgrade to {siteConfig.name} Premium for expanded daily quotas and ad-free priority processing.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold text-center max-w-xl mx-auto">
          {notice}
        </div>
      )}

      {/* Pricing Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* FREE PLAN */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">Free Tier</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-400 text-xs">/ forever</span>
              </div>
              <p className="text-xs text-slate-500">
                Quick, casual video downloading with zero registration required.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>20 Daily URL Analyses</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>10 Daily File Downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>500 MB Max File Size Cap</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Standard Queue Processing</span>
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs transition-colors text-center"
          >
            <span>Use Free Downloader</span>
          </Link>
        </div>

        {/* PREMIUM PLAN */}
        <div className="p-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 dark:text-amber-600">
                {siteConfig.name} Premium
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white dark:text-slate-900">$9.99</span>
                <span className="text-slate-400 dark:text-slate-600 text-xs">/ month</span>
              </div>
              <p className="text-xs text-slate-300 dark:text-slate-600">
                For heavy users needing expanded limits, 10x priority processing, and zero ads.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200 dark:text-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 dark:text-amber-600 flex-shrink-0" />
                <span className="font-bold">200 Daily URL Analyses (10x quota)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 dark:text-amber-600 flex-shrink-0" />
                <span className="font-bold">100 Daily File Downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 dark:text-amber-600 flex-shrink-0" />
                <span>2 GB Max File Size Cap</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 dark:text-amber-600 flex-shrink-0" />
                <span>100% Ad-Free Experience</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
