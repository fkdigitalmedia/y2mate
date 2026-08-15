import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import AdSlot from '@/components/AdSlot';
import LegalNotice from '@/components/LegalNotice';
import { constructMetadata } from '@/config/seo';
import { getRelatedLinks } from '@/lib/internal-links';

export const metadata: Metadata = constructMetadata({
  title: 'Video Quality & Resolutions Explained – 360p, 720p, 1080p | y2matevideo.com',
  description: 'Learn how video resolution, frame rates, and bitrates affect download file sizes and clarity.',
  canonical: '/guides/video-quality-explained',
});

export default function VideoQualityExplainedGuidePage() {
  const breadcrumbs = [
    { name: 'Guides', href: '/guides/how-to-download-online-videos' },
    { name: 'Video Quality Explained', href: '/guides/video-quality-explained' },
  ];
  const relatedLinks = getRelatedLinks('mp4-downloader');

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <header className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Resolution & Bitrate Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Video Quality & Resolutions Explained
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Comparing 360p Compact, 720p HD, 1080p Full HD, and estimated download file sizes.
          </p>
        </header>

        <AdSlot slotId="guide-quality-top" format="leaderboard" />

        <article className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resolution & File Size Comparison</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white">360p SD</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Resolution: 640x360. File size: ~8 MB per 5 min video. Best for slow mobile data.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white">720p HD</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Resolution: 1280x720. File size: ~28 MB per 5 min video. Great balance of HD quality & size.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white">1080p Full HD</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Resolution: 1920x1080. File size: ~55 MB per 5 min video. Crisp detail for large screens.</p>
              </div>
            </div>
          </section>
        </article>

        <RelatedTools title="Tools to Download HD Videos" links={relatedLinks} />

        <LegalNotice />
      </div>
    </div>
  );
}
