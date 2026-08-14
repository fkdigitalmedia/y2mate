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
  title: 'MP4 Video Downloader – Download HD MP4 Videos | VidFetch',
  description: 'Download HD MP4 video streams in 720p and 1080p resolutions with VidFetch.',
  canonical: '/mp4-downloader',
});

export default function Mp4DownloaderPage() {
  const breadcrumbs = [{ name: 'Tools', href: '/video-downloader' }, { name: 'MP4 Downloader', href: '/mp4-downloader' }];
  const relatedLinks = getRelatedLinks('mp4-downloader');

  const pageFaqs = [
    {
      question: 'Why is MP4 the recommended video download format?',
      answer: 'MP4 (MPEG-4 Part 14) combined with H.264 video and AAC audio offers universal playback support across iOS, Android, Windows, macOS, and smart TVs.',
    },
    {
      question: 'Can I download 1080p MP4 videos?',
      answer: 'Yes, if the source media provider supports 1080p resolutions, VidFetch will make 1080p Full HD MP4 downloads available.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'VidFetch MP4 Video Downloader',
    url: `${siteConfig.url}/mp4-downloader`,
    description: 'Download online video files in universal MP4 container format.',
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
              Universal MP4 Video Downloader
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Save high-definition MP4 video files in 720p HD or 1080p Full HD with fast, stream-piped downloading.
            </p>
          </div>
          <VideoUrlInput />
        </HeroSection>

        <AdSlot slotId="mp4-tool-top" format="leaderboard" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Universal Device Compatibility</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              MP4 is the standard video container format for web video streaming. VidFetch preserves native H.264 video streams wherever available, allowing direct container remuxing without degrading video quality or re-encoding unnecessarily.
            </p>
          </section>

          <RelatedTools title="Explore Related Media Tools" links={relatedLinks} />

          <FAQSection items={pageFaqs} title="MP4 Downloader FAQ" />

          <LegalNotice />
        </div>
      </div>
    </>
  );
}
