'use client';

import React, { useEffect, useState } from 'react';
import { Server, Activity, ShieldCheck, RefreshCw, Loader2, CheckCircle2, AlertTriangle, XCircle, Sliders } from 'lucide-react';

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProviders = () => {
    setLoading(true);
    fetch('/api/admin/providers')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProviders(json.providers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggle = async (providerId: string, currentEnabled: boolean) => {
    setUpdating(providerId);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, enabled: !currentEnabled }),
      });
      const json = await res.json();
      if (json.success) fetchProviders();
    } catch {
      alert('Failed to update provider toggle.');
    } finally {
      setUpdating(null);
    }
  };

  const handlePriorityChange = async (providerId: string, newPriority: number) => {
    setUpdating(providerId);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, priority: newPriority }),
      });
      const json = await res.json();
      if (json.success) fetchProviders();
    } catch {
      alert('Failed to update priority.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-brand-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Media Providers & Circuit Breakers</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage media processing engines, monitor circuit breaker states, and adjust fallback priorities.
          </p>
        </div>
        <button
          onClick={fetchProviders}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {providers.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-brand-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {p.platformId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Domains: <span className="font-mono">{p.domains.join(', ') || 'Global HTTP Fallback'}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              {/* Circuit Health Badge */}
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Circuit Status</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    p.status === 'HEALTHY'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : p.status === 'DEGRADED'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {p.status === 'HEALTHY' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {p.status === 'DEGRADED' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {p.status === 'UNAVAILABLE' && <XCircle className="w-3.5 h-3.5" />}
                  <span>{p.circuitState} ({p.status})</span>
                </span>
              </div>

              {/* Metrics */}
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Avg Latency</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{p.avgResponseMs} ms</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Success / Fail</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {p.successCount} / {p.failureCount}
                </span>
              </div>

              {/* Priority Selection */}
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Priority</span>
                <select
                  value={p.priority}
                  onChange={(e) => handlePriorityChange(p.id, parseInt(e.target.value, 10))}
                  disabled={updating === p.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                >
                  <option value={100}>100 (High)</option>
                  <option value={50}>50 (Medium)</option>
                  <option value={10}>10 (Low)</option>
                </select>
              </div>

              {/* Enable / Disable Toggle */}
              <button
                onClick={() => handleToggle(p.id, p.enabled)}
                disabled={updating === p.id}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  p.enabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {updating === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : p.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
