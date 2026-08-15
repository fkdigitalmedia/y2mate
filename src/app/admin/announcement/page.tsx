'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Megaphone } from 'lucide-react';

export default function AdminAnnouncementPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    announcement_enabled: false,
    announcement_message: 'Welcome to y2matevideo.com! High-speed media downloader engine online.',
    announcement_url: '/video-downloader',
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Announcement Banner</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure global announcement banner shown at top of website when active.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Announcement settings updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Enable Announcement Banner</span>
            <p className="text-xs text-slate-400">Display announcement bar at the top of the public website.</p>
          </div>
          <input
            type="checkbox"
            checked={form.announcement_enabled}
            onChange={(e) => setForm({ ...form, announcement_enabled: e.target.checked })}
            className="w-5 h-5 rounded accent-brand-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Announcement Message</label>
          <input
            type="text"
            value={form.announcement_message}
            onChange={(e) => setForm({ ...form, announcement_message: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Target Link URL (Internal Route or HTTPS)</label>
          <input
            type="text"
            value={form.announcement_url}
            onChange={(e) => setForm({ ...form, announcement_url: e.target.value })}
            placeholder="/video-downloader"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Announcement Settings</span>
        </button>
      </form>
    </div>
  );
}
