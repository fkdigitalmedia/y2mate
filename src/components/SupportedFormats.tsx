'use client';

import React from 'react';
import { siteConfig } from '@/config/site';

export default function SupportedFormats() {
  return (
    <section className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Supported Formats
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Available formats depend on the source video stream and platform capabilities.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {siteConfig.supportedFormats.map((fmt) => (
            <div
              key={fmt.name}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-bold text-xs flex items-center justify-center uppercase">
                  {fmt.name}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  {fmt.badge}
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {fmt.name} Container
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {fmt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
