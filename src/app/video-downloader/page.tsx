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
  title: 'Online Video Downloader – Save Web Videos | y2matevideo.com',
  description: 'Analyze online video URLs and convert or save permitted media in MP4 video or MP3 audio formats with y2matevideo.com.',
  canonical: '/video-downloader',
});

export default function VideoDownloaderPage() {
  const breadcrumbs = [{ name: 'Tools', href: '/video-downloader' }, { name: 'Video Downloader', href: '/video-downloader' }];
  const relatedLinks = getRelatedLinks('video-downloader');

  const pageFaqs = [
    {
      question: 'What is the y2matevideo.com Video Downloader?',
      answer: 'y2matevideo.com Video Downloader is a web tool that analyzes video links from permitted platforms and generates downloadable video (MP4) and audio (MP3) files.',
    },
    {
      question: 'Which video qualities are available for download?',
      answer: 'Depending on the source video quality, y2matevideo.com supports resolutions from 360p Compact up to 1080p Full HD.',
    },
    {
      question: 'Does the downloader require software installation?',
      answer: 'No installation is needed. It works completely inside your modern desktop or mobile web browser.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'y2matevideo.com Online Video Downloader',
    url: `${siteConfig.url}/video-downloader`,
    description: 'Fast online video analysis and conversion tool.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="space-y-8 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        <HeroSection>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Online Video Downloader
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Analyze supported video links and choose available MP4 video or MP3 audio streams in seconds.
            </p>
          </div>
          <VideoUrlInput />
        </HeroSection>

        <AdSlot slotId="tool-page-top" format="leaderboard" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How the Video Downloader Pipeline Works</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              When you submit a URL to y2matevideo.com, our analysis service verifies domain permissions and retrieves available format stream descriptors. After selecting your desired quality, an isolated background worker streams the source media into temporary disk storage and executes container normalization or audio extraction using FFmpeg.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">Step 1</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">Paste Link</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paste your video link into the search box above.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">Step 2</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">Select Format</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose between MP4 video resolutions or MP3 audio.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">Step 3</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">Download</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Download your media file via secure signed link.</p>
              </div>
            </div>
          </section>

          <RelatedTools title="Explore More Tools & Formats" links={relatedLinks} />

          <FAQSection items={pageFaqs} title="Video Downloader FAQ" />

          <LegalNotice />
        </div>
      </div>
    </>
  );
}
