'use client';

import React from 'react';
import { Copy, Sliders, Download } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Paste a URL',
      description: 'Copy the link of any video from your browser or app and paste it into the input box.',
      icon: Copy,
    },
    {
      number: '02',
      title: 'Choose a format',
      description: 'Select your preferred video resolution (1080p, 720p, MP4) or audio quality (MP3 up to 320 kbps).',
      icon: Sliders,
    },
    {
      number: '03',
      title: 'Download',
      description: 'Click Download to process the media and save your file directly to your device.',
      icon: Download,
    },
  ];

  return (
    <section className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Download online videos and audio in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-mono font-extrabold text-2xl text-slate-300 dark:text-slate-700">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
