'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Zap } from 'lucide-react';

export default function BillingSuccessPage() {
  const [verifying, setVerifying] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Poll server for verified webhook activation
    const timer = setTimeout(() => {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((json) => {
          if (json.user && json.user.isPremium) {
            setActive(true);
          }
        })
        .catch(() => {})
        .finally(() => setVerifying(false));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          {verifying ? <Loader2 className="w-8 h-8 animate-spin text-brand-500" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {verifying ? 'Verifying Payment...' : active ? 'Premium Activated!' : 'Payment Received'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {verifying
              ? 'We are verifying your transaction with our payment provider...'
              : active
              ? 'Your Premium subscription is active! Enjoy 200 daily analyses, 10x priority speed, and zero ads.'
              : 'Thank you! Premium activation may take a few moments as webhook signature verification completes.'}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Start Downloading Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
