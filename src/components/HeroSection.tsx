'use client';

import React from 'react';
import UsageCounter from './UsageCounter';

interface HeroSectionProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function HeroSection({
  title = 'Download videos online',
  description = 'Paste a video URL below to find available video and audio formats.',
  children,
}: HeroSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {/* Small Eyebrow */}
        <span className="inline-block text-[11px] font-mono uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
          ONLINE VIDEO DOWNLOADER
        </span>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          {description}
        </p>

        {/* Downloader Input & Children Slot */}
        <div className="max-w-2xl mx-auto space-y-4 pt-2">
          {children}

          {/* Usage Counter Widget */}
          <div className="pt-1 flex justify-center">
            <UsageCounter />
          </div>
        </div>
      </div>
    </section>
  );
}
