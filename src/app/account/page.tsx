'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Shield, CreditCard, Activity, LogOut, Loader2, Zap } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.authenticated && json.user) {
          setUser(json.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-brand-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Account Control Portal</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage profile, subscription, and usage quotas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{user.displayName || 'VidFetch User'}</h3>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Account Role:</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{user.role}</span>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
            <CreditCard className="w-4 h-4 text-accent-500" />
          </div>
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${user.isPremium ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {user.isPremium ? 'VidFetch Premium' : 'Free Tier'}
            </span>
          </div>
          <Link
            href="/account/billing"
            className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline pt-2"
          >
            Manage Subscription →
          </Link>
        </div>

        {/* Quick Actions Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Security</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active session encrypted with HTTP-Only security cookie.</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
