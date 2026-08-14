import React from 'react';
import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import VideoUrlInput from '@/components/VideoUrlInput';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import AdSlot from '@/components/AdSlot';
import FAQSection from '@/components/FAQSection';
import LegalNotice from '@/components/LegalNotice';
import { constructMetadata } from '@/config/seo';
import { getRelatedLinks } from '@/lib/internal-links';

export const metadata: Metadata = constructMetadata({
  title: 'Online Video Converter – MP4, WebM, MP3 & M4A | VidFetch',
  description: 'Convert online media URLs into MP4, WebM, MP3, or M4A formats with VidFetch.',
  canonical: '/video-converter',
});

export default function VideoConverterPage() {
  const breadcrumbs = [{ name: 'Tools', href: '/video-downloader' }, { name: 'Video Converter', href: '/video-converter' }];
  const relatedLinks = getRelatedLinks('video-downloader');

  const pageFaqs = [
    {
      question: 'Which format conversions does VidFetch support?',
      answer: 'VidFetch supports MP4 container remuxing, WebM HTML5 video, MP3 320kbps audio extraction, and M4A AAC audio containers.',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <HeroSection>
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Online Video Converter
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Convert permitted video links into MP4, WebM, MP3, or M4A media formats instantly.
          </p>
        </div>
        <VideoUrlInput />
      </HeroSection>

      <AdSlot slotId="converter-tool-top" format="leaderboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cloud Media Conversion Engine</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Our background worker pipeline isolates FFmpeg conversion jobs, preventing local battery drain or device slowdown during format transcoding.
          </p>
        </section>

        <RelatedTools title="More Converter Tools" links={relatedLinks} />

        <FAQSection items={pageFaqs} title="Video Converter FAQ" />

        <LegalNotice />
      </div>
    </div>
  );
}
