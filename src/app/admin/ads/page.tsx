'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Megaphone } from 'lucide-react';

export default function AdminAdsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    ads_enabled: true,
    ad_client_id: 'ca-pub-1234567890123456',
    ad_slot_home_top: '1234567890',
    ad_slot_result: '0987654321',
    ad_slot_content: '1122334455',
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Advertisement Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure AdSense client ID and placement slot IDs.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Ad settings saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Enable Advertisements</span>
            <p className="text-xs text-slate-400">Toggle whether ad banner slots are active across the website.</p>
          </div>
          <input
            type="checkbox"
            checked={form.ads_enabled}
            onChange={(e) => setForm({ ...form, ads_enabled: e.target.checked })}
            className="w-5 h-5 rounded accent-brand-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Google AdSense Publisher ID (ca-pub-xxx)</label>
          <input
            type="text"
            value={form.ad_client_id}
            onChange={(e) => setForm({ ...form, ad_client_id: e.target.value })}
            placeholder="ca-pub-1234567890123456"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Homepage Slot ID</label>
            <input
              type="text"
              value={form.ad_slot_home_top}
              onChange={(e) => setForm({ ...form, ad_slot_home_top: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Result Card Slot ID</label>
            <input
              type="text"
              value={form.ad_slot_result}
              onChange={(e) => setForm({ ...form, ad_slot_result: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Content Footer Slot ID</label>
            <input
              type="text"
              value={form.ad_slot_content}
              onChange={(e) => setForm({ ...form, ad_slot_content: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Ad Settings</span>
        </button>
      </form>
    </div>
  );
}
