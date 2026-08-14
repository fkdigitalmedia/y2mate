'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Search } from 'lucide-react';

export default function AdminSeoPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    default_seo_title: 'Video Downloader – Download Online Videos | VidFetch',
    default_seo_description: 'VidFetch lets you analyze supported video URLs and choose available video or audio formats in a simple, mobile-friendly interface.',
    default_og_image: '/og-image.jpg',
    twitter_handle: '@vidfetch',
    google_site_verification: '',
    allow_indexing: true,
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">SEO & Search Engine Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage global meta tags, Open Graph cards, Search Console verification, and indexing.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>SEO settings updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Default Title Tag</label>
          <input
            type="text"
            value={form.default_seo_title}
            onChange={(e) => setForm({ ...form, default_seo_title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Default Meta Description</label>
          <textarea
            rows={3}
            value={form.default_seo_description}
            onChange={(e) => setForm({ ...form, default_seo_description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Open Graph Image URL</label>
            <input
              type="text"
              value={form.default_og_image}
              onChange={(e) => setForm({ ...form, default_og_image: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Twitter / X Creator Handle</label>
            <input
              type="text"
              value={form.twitter_handle}
              onChange={(e) => setForm({ ...form, twitter_handle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Google Search Console Verification Token</label>
          <input
            type="text"
            value={form.google_site_verification}
            onChange={(e) => setForm({ ...form, google_site_verification: e.target.value })}
            placeholder="google-site-verification-token-string"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-semibold"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Allow Search Engine Indexing</span>
            <p className="text-xs text-slate-400">Toggle whether search engine bots are allowed to index public pages.</p>
          </div>
          <input
            type="checkbox"
            checked={form.allow_indexing}
            onChange={(e) => setForm({ ...form, allow_indexing: e.target.checked })}
            className="w-5 h-5 rounded accent-brand-600 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save SEO Settings</span>
        </button>
      </form>
    </div>
  );
}
