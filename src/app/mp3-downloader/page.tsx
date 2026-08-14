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
  title: 'MP3 Downloader – Convert Videos to High Quality Audio | VidFetch',
  description: 'Extract MP3 audio streams up to 320 kbps from permitted video links with VidFetch.',
  canonical: '/mp3-downloader',
});

export default function Mp3DownloaderPage() {
  const breadcrumbs = [{ name: 'Tools', href: '/video-downloader' }, { name: 'MP3 Downloader', href: '/mp3-downloader' }];
  const relatedLinks = getRelatedLinks('mp3-downloader');

  const pageFaqs = [
    {
      question: 'What audio bitrates are available for MP3 downloads?',
      answer: 'VidFetch supports MP3 audio extractions at 320 kbps High Quality and 128 kbps Standard Quality, depending on source audio stream availability.',
    },
    {
      question: 'Is audio extraction performed without losing quality?',
      answer: 'Audio extraction decodes the source video audio stream into an optimized MP3 container using FFmpeg libmp3lame, preserving original audio fidelity.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'VidFetch MP3 Downloader',
    url: `${siteConfig.url}/mp3-downloader`,
    description: 'Convert online video streams into high-quality MP3 audio files.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="space-y-8 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        <HeroSection>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              MP3 Audio Downloader
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Extract high-fidelity MP3 audio files (up to 320 kbps) directly from permitted online video URLs.
            </p>
          </div>
          <VideoUrlInput />
        </HeroSection>

        <AdSlot slotId="mp3-tool-top" format="leaderboard" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">High Quality MP3 Extraction Architecture</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              When converting video streams to MP3 audio, VidFetch utilizes an isolated FFmpeg audio extraction worker. The worker strips the video stream (`-vn`) and encodes the audio track using the `libmp3lame` codec, ensuring maximum compatibility with music players and smartphones.
            </p>
          </section>

          <RelatedTools title="Related Audio & Video Tools" links={relatedLinks} />

          <FAQSection items={pageFaqs} title="MP3 Downloader FAQ" />

          <LegalNotice />
        </div>
      </div>
    </>
  );
}
