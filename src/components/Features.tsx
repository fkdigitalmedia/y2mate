'use client';

import React from 'react';
import { Zap, Layers, Smartphone, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Features() {
  const features = [
    {
      title: 'Fast Processing',
      description: 'Designed for a simple and efficient download experience.',
      icon: Zap,
    },
    {
      title: 'Multiple Formats',
      description: 'Choose from available video and audio formats.',
      icon: Layers,
    },
    {
      title: 'Mobile Friendly',
      description: 'Works smoothly across phones, tablets and desktops.',
      icon: Smartphone,
    },
    {
      title: 'Simple Interface',
      description: 'No registration or complicated setup required.',
      icon: Sparkles,
    },
  ];

  return (
    <section className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Use {siteConfig.name}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            A clean, reliable web tool built for high performance and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="w-8 h-8 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
