'use client';

import React, { useEffect } from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'leaderboard' | 'rectangle' | 'banner' | 'auto';
  className?: string;
}

export default function AdSlot({
  slotId,
  format = 'auto',
  className = '',
}: AdSlotProps) {
  const adClientId = process.env.NEXT_PUBLIC_AD_CLIENT_ID;
  const isProdAd = Boolean(adClientId && slotId);

  useEffect(() => {
    if (isProdAd && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        // Suppress redundant script errors
      }
    }
  }, [isProdAd]);

  if (isProdAd && adClientId) {
    return (
      <div className={`w-full max-w-4xl mx-auto my-6 text-center overflow-hidden ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Clean placeholder container for non-ad / local dev environments without layout shift
  return (
    <div
      className={`w-full max-w-4xl mx-auto my-6 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center flex flex-col items-center justify-center min-h-[90px] text-slate-400 dark:text-slate-600 ${className}`}
    >
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
        Advertisement Space
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">
        Reserved Ad Placement Slot ({slotId || 'content-banner'})
      </span>
    </div>
  );
}
