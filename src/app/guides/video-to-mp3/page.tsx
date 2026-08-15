import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import AdSlot from '@/components/AdSlot';
import LegalNotice from '@/components/LegalNotice';
import { constructMetadata } from '@/config/seo';
import { getRelatedLinks } from '@/lib/internal-links';

export const metadata: Metadata = constructMetadata({
  title: 'Video to MP3 Extraction Guide – Bitrates & Codecs | y2matevideo.com',
  description: 'Understand audio extraction, bitrates (128kbps vs 320kbps), and AAC vs MP3 codecs.',
  canonical: '/guides/video-to-mp3',
});

export default function VideoToMp3GuidePage() {
  const breadcrumbs = [
    { name: 'Guides', href: '/guides/how-to-download-online-videos' },
    { name: 'Video to MP3 Guide', href: '/guides/video-to-mp3' },
  ];
  const relatedLinks = getRelatedLinks('mp3-downloader');

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <header className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Audio Technical Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Video to MP3 Audio Extraction Guide
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Understanding audio codecs, sampling rates, bitrates, and how FFmpeg extracts pristine audio streams.
          </p>
        </header>

        <AdSlot slotId="guide-mp3-top" format="leaderboard" />

        <article className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What Happens During Audio Extraction?</h2>
            <p>
              When extracting audio from a video stream, y2matevideo.com parses the media container to isolate the audio track (`-vn`). If the source already contains a compatible AAC stream, it can be remuxed directly into an M4A file, or re-encoded into MP3 using the `libmp3lame` codec.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Audio Bitrate Benchmarks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white">128 kbps Standard</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Compact file size (~1MB/min). Ideal for mobile data savings and spoken audio podcasts.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white">320 kbps High Quality</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maximum MP3 audio resolution (~2.4MB/min). Recommended for music, concerts, and acoustic audio.</p>
              </div>
            </div>
          </section>
        </article>

        <RelatedTools title="Related Audio Extractor Tools" links={relatedLinks} />

        <LegalNotice />
      </div>
    </div>
  );
}
