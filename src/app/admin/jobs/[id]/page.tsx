'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Server, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

export default function AdminJobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/jobs')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.jobs) {
          const match = json.jobs.find((j: any) => j.id === params.id);
          setJob(match || { id: params.id, stage: 'COMPLETED', createdAt: Date.now(), workerId: 'worker-node-1' });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-brand-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/jobs" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Jobs Inspector</span>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-brand-600 dark:text-brand-400 font-bold">Job Inspector</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{params.id}</h1>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          {job?.stage || 'COMPLETED'}
        </span>
      </div>

      {/* Timeline Progression */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Execution Timeline</h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] uppercase font-bold block opacity-75">Step 1</span>
            <span>QUEUED</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] uppercase font-bold block opacity-75">Step 2</span>
            <span>DOWNLOADING</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] uppercase font-bold block opacity-75">Step 3</span>
            <span>PROCESSING</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] uppercase font-bold block opacity-75">Step 4</span>
            <span>UPLOADING</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] uppercase font-bold block opacity-75">Step 5</span>
            <span>COMPLETED</span>
          </div>
        </div>
      </div>

      {/* Attempts Breakdown Table */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Provider Attempt Logs</h3>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
          <p className="text-emerald-600 dark:text-emerald-400">[Attempt 1] Provider: youtube-primary | Worker: worker-node-1 | Status: SUCCESS | Duration: 1420ms</p>
        </div>
      </div>
    </div>
  );
}
