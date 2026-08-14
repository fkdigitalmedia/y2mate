'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, DollarSign, ShieldAlert } from 'lucide-react';

export default function AdminMonetizationPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    monetization_enabled: true,
    free_daily_analyses: 20,
    free_daily_downloads: 10,
    free_max_file_size_mb: 500,
    premium_enabled: false,
    premium_daily_analyses: 200,
    premium_daily_downloads: 100,
    premium_max_file_size_mb: 2048,
    premium_priority: 100,
    premium_ads_removed: true,
    refund_failed_jobs: true,
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.settings) {
          setForm((prev) => ({ ...prev, ...json.settings }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      for (const [key, value] of Object.entries(form)) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Suppress
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Monetization & Usage Tier Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure daily usage limits, file size caps, queue priorities, and monetization flags.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Monetization settings updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-8">
        {/* Free Tier Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Free Tier Limits</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Daily Analyses Limit</label>
              <input
                type="number"
                value={form.free_daily_analyses}
                onChange={(e) => setForm({ ...form, free_daily_analyses: parseInt(e.target.value, 10) || 20 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Daily Downloads Limit</label>
              <input
                type="number"
                value={form.free_daily_downloads}
                onChange={(e) => setForm({ ...form, free_daily_downloads: parseInt(e.target.value, 10) || 10 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Max File Size (MB)</label>
              <input
                type="number"
                value={form.free_max_file_size_mb}
                onChange={(e) => setForm({ ...form, free_max_file_size_mb: parseInt(e.target.value, 10) || 500 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Premium Tier Architecture Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
              Premium Tier Settings (Payment Architecture)
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Enable Premium Architecture</span>
              <input
                type="checkbox"
                checked={form.premium_enabled}
                onChange={(e) => setForm({ ...form, premium_enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Premium Daily Analyses</label>
              <input
                type="number"
                value={form.premium_daily_analyses}
                onChange={(e) => setForm({ ...form, premium_daily_analyses: parseInt(e.target.value, 10) || 200 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Premium Daily Downloads</label>
              <input
                type="number"
                value={form.premium_daily_downloads}
                onChange={(e) => setForm({ ...form, premium_daily_downloads: parseInt(e.target.value, 10) || 100 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Premium Max File Size (MB)</label>
              <input
                type="number"
                value={form.premium_max_file_size_mb}
                onChange={(e) => setForm({ ...form, premium_max_file_size_mb: parseInt(e.target.value, 10) || 2048 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Refund & Behavior Settings */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Refund Usage on Internal Infrastructure Failures</span>
            <p className="text-xs text-slate-400">If a processing job fails due to worker error, restore 1 download attempt to the user.</p>
          </div>
          <input
            type="checkbox"
            checked={form.refund_failed_jobs}
            onChange={(e) => setForm({ ...form, refund_failed_jobs: e.target.checked })}
            className="w-5 h-5 rounded accent-brand-600 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Monetization Settings</span>
        </button>
      </form>
    </div>
  );
}
