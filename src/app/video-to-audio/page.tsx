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
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: 'Video to Audio Converter – Extract MP3 & M4A | y2matevideo.com',
  description: 'Convert video URLs to MP3 and M4A audio files quickly and securely with y2matevideo.com.',
  canonical: '/video-to-audio',
});

export default function VideoToAudioPage() {
  const breadcrumbs = [{ name: 'Tools', href: '/video-downloader' }, { name: 'Video to Audio', href: '/video-to-audio' }];
  const relatedLinks = getRelatedLinks('mp3-downloader');

  const pageFaqs = [
    {
      question: 'How does video to audio extraction work?',
      answer: 'y2matevideo.com fetches the source video stream, strips video frames, and re-encodes audio into MP3 or M4A formats using FFmpeg.',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <HeroSection>
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Video to Audio Extractor
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Convert permitted online videos into downloadable MP3 or M4A audio tracks.
          </p>
        </div>
        <VideoUrlInput />
      </HeroSection>

      <AdSlot slotId="v2a-tool-top" format="leaderboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fast Stream Decoupling</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Extracting audio from web streams allows listening on mobile devices, car stereos, and offline music players without buffering heavy video data.
          </p>
        </section>

        <RelatedTools title="Related Audio Extractor Tools" links={relatedLinks} />

        <FAQSection items={pageFaqs} title="Video to Audio FAQ" />

        <LegalNotice />
      </div>
    </div>
  );
}
