'use client';

import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle2, XCircle, Power, Loader2 } from 'lucide-react';

export default function AdminPlatformsPage() {
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<any[]>([]);

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/platforms');
      const json = await res.json();
      if (json.success) {
        setPlatforms(json.platforms);
      }
    } catch {
      // Suppress
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const togglePlatform = async (platformId: string, currentEnabled: boolean) => {
    try {
      const res = await fetch('/api/admin/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId, enabled: !currentEnabled }),
      });
      const json = await res.json();
      if (json.success) {
        setPlatforms((prev) =>
          prev.map((p) => (p.id === platformId ? { ...p, enabled: !currentEnabled } : p))
        );
      }
    } catch {
      // Suppress
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Platform Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enable or disable media source adapters dynamically. Disabling a platform blocks analysis requests server-side without deploying code.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center text-brand-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {platforms.map((p) => (
              <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.name}</h3>
                    <p className="text-xs text-slate-400">Domains: {p.domains.length > 0 ? p.domains.join(', ') : 'Direct HTTP Stream'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.enabled
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {p.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{p.enabled ? 'Enabled' : 'Disabled'}</span>
                  </span>

                  <button
                    onClick={() => togglePlatform(p.id, p.enabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                      p.enabled
                        ? 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{p.enabled ? 'Disable' : 'Enable'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
