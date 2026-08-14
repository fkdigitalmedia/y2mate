import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import AdSlot from '@/components/AdSlot';
import LegalNotice from '@/components/LegalNotice';
import { constructMetadata } from '@/config/seo';
import { getRelatedLinks } from '@/lib/internal-links';

export const metadata: Metadata = constructMetadata({
  title: 'Video Formats Explained – MP4, WebM, M4A & Codecs | VidFetch',
  description: 'Learn the differences between video container formats, video codecs (H.264, VP9), and audio codecs (AAC, MP3).',
  canonical: '/guides/video-formats-explained',
});

export default function VideoFormatsExplainedGuidePage() {
  const breadcrumbs = [
    { name: 'Guides', href: '/guides/how-to-download-online-videos' },
    { name: 'Video Formats Explained', href: '/guides/video-formats-explained' },
  ];
  const relatedLinks = getRelatedLinks('formats');

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <header className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Container & Codec Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Video Formats & Codecs Explained
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            What is the difference between a video container format and a video codec?
          </p>
        </header>

        <AdSlot slotId="guide-formats-top" format="leaderboard" />

        <article className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Container vs. Codec</h2>
            <p>
              A <strong>container</strong> (such as `.mp4`, `.webm`, or `.m4a`) is a digital wrapper that holds video frames, audio tracks, and subtitles together. A <strong>codec</strong> (such as `H.264`, `VP9`, `AAC`, or `MP3`) is the compression algorithm that encodes and decodes raw audio and video data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Container Comparison Matrix</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>MP4 (H.264 + AAC)</strong>: Universal hardware compatibility across all smartphones, PCs, and TVs.</li>
              <li><strong>WebM (VP9 + Opus)</strong>: Open-source HTML5 video format with high compression efficiency for web browsers.</li>
              <li><strong>M4A (AAC)</strong>: Apple ecosystem default audio container with superior fidelity over legacy MP3.</li>
            </ul>
          </section>
        </article>

        <RelatedTools title="Format Breakdown Pages" links={relatedLinks} />

        <LegalNotice />
      </div>
    </div>
  );
}
