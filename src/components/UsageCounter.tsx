'use client';

import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export default function UsageCounter() {
  const [usage, setUsage] = useState<{
    analysesRemaining: number;
    analysesLimit: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.usage) {
          setUsage(json.usage);
        }
      })
      .catch(() => {});
  }, []);

  if (!usage) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
      <Activity className="w-3.5 h-3.5 text-brand-500" />
      <span>
        <strong className="text-slate-700 dark:text-slate-300 font-bold">{usage.analysesRemaining}</strong> of{' '}
        {usage.analysesLimit} free analyses remaining today
      </span>
    </div>
  );
}
