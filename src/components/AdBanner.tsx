'use client';

import React from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'leaderboard' | 'rectangle' | 'banner';
  className?: string;
}

export default function AdBanner({
  slotId = 'default-ad-slot',
  format = 'leaderboard',
  className = '',
}: AdBannerProps) {
  return (
    <div
      className={`w-full max-w-4xl mx-auto my-6 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-center flex flex-col items-center justify-center min-h-[90px] text-slate-400 dark:text-slate-600 ${className}`}
    >
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
        Advertisement Placement ({format})
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-600 mt-1">
        [Ad Slot: {slotId}] - Ready for AdSense / Ezoic / Adsterra Integration
      </span>
    </div>
  );
}
