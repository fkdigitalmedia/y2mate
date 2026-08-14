'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, FileText } from 'lucide-react';

export default function AdminLegalPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    terms_notice: 'VidFetch is provided as is without warranty of any kind. You must only process media you own or have explicit permission to download.',
    privacy_notice: 'We do not sell personal data. Essential cookies preserve user theme choices and analytics consent.',
    dmca_notice: 'To submit a copyright infringement notice, please include the exact source URL and proof of copyright ownership.',
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Legal Policy Content Editor</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage public Terms of Service, Privacy Policy, and Copyright DMCA disclosures.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Legal disclosures saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Terms of Service Summary Notice</label>
          <textarea
            rows={3}
            value={form.terms_notice}
            onChange={(e) => setForm({ ...form, terms_notice: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Privacy Policy Summary Notice</label>
          <textarea
            rows={3}
            value={form.privacy_notice}
            onChange={(e) => setForm({ ...form, privacy_notice: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">DMCA Copyright Notice</label>
          <textarea
            rows={3}
            value={form.dmca_notice}
            onChange={(e) => setForm({ ...form, dmca_notice: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Legal Content</span>
        </button>
      </form>
    </div>
  );
}
