'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminSecurityPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    analyze_rate_limit: 10,
    download_rate_limit: 5,
    max_url_length: 2048,
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Security & Limits</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure rate limits and maximum URL length bounds.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Security limits updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Analyze Rate Limit (Req/Min/IP)</label>
            <input
              type="number"
              value={form.analyze_rate_limit}
              onChange={(e) => setForm({ ...form, analyze_rate_limit: parseInt(e.target.value, 10) || 10 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Download Rate Limit (Req/Min/IP)</label>
            <input
              type="number"
              value={form.download_rate_limit}
              onChange={(e) => setForm({ ...form, download_rate_limit: parseInt(e.target.value, 10) || 5 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white">Note on Core Security Safeguards:</span>
          <p>SSRF IP block checks (RFC1918, 127.0.0.1, 169.254.169.254) and isolated process execution bounds remain strictly enforced in code and cannot be bypassed.</p>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Security Limits</span>
        </button>
      </form>
    </div>
  );
}
