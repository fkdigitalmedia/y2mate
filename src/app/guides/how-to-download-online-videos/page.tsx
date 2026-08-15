import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import AdSlot from '@/components/AdSlot';
import LegalNotice from '@/components/LegalNotice';
import { constructMetadata } from '@/config/seo';
import { getRelatedLinks } from '@/lib/internal-links';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: 'How to Download Online Videos Step-by-Step Guide | y2matevideo.com',
  description: 'Learn how to analyze, select formats, and save web videos safely on mobile and desktop devices.',
  canonical: '/guides/how-to-download-online-videos',
});

export default function HowToDownloadGuidePage() {
  const breadcrumbs = [
    { name: 'Guides', href: '/guides/how-to-download-online-videos' },
    { name: 'How to Download Videos', href: '/guides/how-to-download-online-videos' },
  ];
  const relatedLinks = getRelatedLinks('video-downloader');

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'How to Download Online Videos Step-by-Step Guide',
    description: 'Learn how to analyze, select formats, and save web videos safely.',
    url: `${siteConfig.url}/guides/how-to-download-online-videos`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="space-y-8 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <header className="space-y-3 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              User Tutorial Guide
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How to Download Online Videos
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              A comprehensive guide to analyzing media URLs, choosing resolutions, and downloading MP4 video files safely.
            </p>
          </header>

          <AdSlot slotId="guide-top-banner" format="leaderboard" />

          <article className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Copy the Source Video URL</h2>
              <p>
                Open your preferred web browser or mobile application, navigate to the public video page you wish to download, and copy the full URL from the address bar or share menu.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Paste into y2matevideo.com</h2>
              <p>
                Navigate to y2matevideo.com, paste the copied link into the URL input box, and press <strong>Analyze</strong>. y2matevideo.com verifies the URL, checks for domain permissions, and retrieves available format stream metadata.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Select Format & Quality</h2>
              <p>
                Switch between <strong>VIDEO</strong> (360p, 720p, 1080p MP4) and <strong>AUDIO</strong> (128kbps, 320kbps MP3). Click the Download button next to your chosen option.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Background Processing & Download</h2>
              <p>
                Our isolated worker service streams the media source, executes FFmpeg container remuxing, and generates a temporary signed download link valid for 30 minutes.
              </p>
            </section>
          </article>

          <RelatedTools title="Tools Featured in This Guide" links={relatedLinks} />

          <LegalNotice />
        </div>
      </div>
    </>
  );
}
