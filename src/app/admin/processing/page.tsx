'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Cpu } from 'lucide-react';

export default function AdminProcessingPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    max_input_file_size_mb: 500,
    max_output_file_size_mb: 500,
    processing_timeout_seconds: 300,
    job_ttl_minutes: 60,
    max_job_retries: 2,
    worker_concurrency: 2,
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Processing Parameters</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure worker execution limits, maximum file sizes, and concurrency.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Processing settings updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Max Input File Size (MB)</label>
            <input
              type="number"
              value={form.max_input_file_size_mb}
              onChange={(e) => setForm({ ...form, max_input_file_size_mb: parseInt(e.target.value, 10) || 500 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Max Output File Size (MB)</label>
            <input
              type="number"
              value={form.max_output_file_size_mb}
              onChange={(e) => setForm({ ...form, max_output_file_size_mb: parseInt(e.target.value, 10) || 500 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Processing Timeout (Seconds)</label>
            <input
              type="number"
              value={form.processing_timeout_seconds}
              onChange={(e) => setForm({ ...form, processing_timeout_seconds: parseInt(e.target.value, 10) || 300 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Worker Concurrency</label>
            <input
              type="number"
              value={form.worker_concurrency}
              onChange={(e) => setForm({ ...form, worker_concurrency: parseInt(e.target.value, 10) || 2 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Processing Parameters</span>
        </button>
      </form>
    </div>
  );
}
