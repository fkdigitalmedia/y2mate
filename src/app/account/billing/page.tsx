'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Calendar, CheckCircle2, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export default function AccountBillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/billing/subscription')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.subscription) {
          setSub(json.subscription);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Premium subscription? You will retain access until the end of the period.')) return;

    setCancelling(true);
    setMessage(null);

    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage(json.message);
        setSub((prev: any) => ({ ...prev, cancelAtPeriodEnd: true }));
      }
    } catch {
      setMessage('Failed to cancel subscription.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-brand-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!sub) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Subscription Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review active plan, renewal dates, and payment settings.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Active Plan</span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{sub.planName}</h2>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
              sub.status === 'ACTIVE'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {sub.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">Billing Price:</span>
            <p className="text-base font-bold text-slate-900 dark:text-white">{sub.price}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">Next Billing / Renewal Date:</span>
            <p className="text-base font-bold text-slate-900 dark:text-white">{sub.nextBillingDate}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Change Plan / Upgrade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Cancel Subscription</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
