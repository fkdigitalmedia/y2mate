'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Clock, CheckCircle2, XCircle, Loader2, Search, Filter } from 'lucide-react';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/jobs')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setJobs(json.jobs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-brand-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Job Diagnostics & Inspector</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor media processing execution, worker concurrency, and attempt timelines.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Job ID</th>
                <th className="px-6 py-3.5">Stage</th>
                <th className="px-6 py-3.5">Platform</th>
                <th className="px-6 py-3.5">Format</th>
                <th className="px-6 py-3.5">Worker</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No active or recent jobs found in queue.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">{job.id}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          job.stage === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : job.stage === 'FAILED'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                        }`}
                      >
                        {job.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{job.platformId || 'YouTube'}</td>
                    <td className="px-6 py-4 font-mono">{job.formatId || 'mp4'}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{job.workerId || 'worker-node-1'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(job.createdAt).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
