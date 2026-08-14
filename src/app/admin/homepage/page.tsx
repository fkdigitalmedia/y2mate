'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminHomepageEditorPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    hero_title: 'Download Videos & Audio Online',
    hero_description: 'Paste any video link to analyze formats and save MP4 video or MP3 audio streams in seconds.',
    input_placeholder: 'Paste video or audio link here (e.g. YouTube, Vimeo, TikTok)...',
    button_text: 'Analyze',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Homepage Content Editor</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Edit public hero text, downloader input placeholders, and CTA copy.</p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview Homepage</span>
        </Link>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Homepage content updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hero Main Title</label>
          <input
            type="text"
            value={form.hero_title}
            onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hero Subtitle / Description</label>
          <textarea
            rows={3}
            value={form.hero_description}
            onChange={(e) => setForm({ ...form, hero_description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Input Box Placeholder</label>
            <input
              type="text"
              value={form.input_placeholder}
              onChange={(e) => setForm({ ...form, input_placeholder: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Analyze Button Label</label>
            <input
              type="text"
              value={form.button_text}
              onChange={(e) => setForm({ ...form, button_text: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Publish Homepage Changes</span>
        </button>
      </form>
    </div>
  );
}
