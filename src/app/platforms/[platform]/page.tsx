import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

interface PlatformDetail {
  id: string;
  name: string;
  tagline: string;
  description: string;
  howItWorks: string;
  supportedFormatsList: string[];
  faqs: { question: string; answer: string }[];
}

const PLATFORM_DETAILS: Record<string, PlatformDetail> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    tagline: 'Download YouTube Videos & Extract MP3 Audio',
    description: 'Analyze permitted public YouTube video URLs and download available MP4 video or MP3 audio files with VidFetch.',
    howItWorks: 'Paste any public YouTube watch link into VidFetch to analyze available 360p, 720p, 1080p MP4 formats and 128kbps/320kbps MP3 audio options.',
    supportedFormatsList: ['1080p Full HD MP4', '720p HD MP4', '480p SD MP4', '360p Compact MP4', '320 kbps High Quality MP3', '128 kbps Standard MP3'],
    faqs: [
      {
        question: 'Can I download YouTube videos in 1080p HD?',
        answer: 'Yes, VidFetch analyzes all resolutions made publicly available by YouTube source streams up to 1080p Full HD.',
      },
      {
        question: 'Can I convert YouTube videos to MP3 audio?',
        answer: 'Yes, VidFetch supports MP3 audio extraction at 320 kbps and 128 kbps for permitted YouTube links.',
      },
    ],
  },
  vimeo: {
    id: 'vimeo',
    name: 'Vimeo',
    tagline: 'Download Vimeo High Quality Cinematic Streams',
    description: 'Analyze public Vimeo video URLs and save high quality MP4 videos or AAC/M4A audio files.',
    howItWorks: 'Submit your Vimeo video page link to extract available HD video streams.',
    supportedFormatsList: ['1080p Full HD MP4', '720p HD MP4', '256 kbps AAC M4A Audio'],
    faqs: [
      {
        question: 'Are high bitrate Vimeo videos supported?',
        answer: 'Yes, Vimeo high-definition MP4 streams are detected and made available for direct download.',
      },
    ],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    tagline: 'Download TikTok Videos & Audio',
    description: 'Save permitted short-form TikTok videos and extract background audio tracks.',
    howItWorks: 'Paste the TikTok video share link into VidFetch to extract HD MP4 video or MP3 audio tracks.',
    supportedFormatsList: ['HD Video MP4', '192 kbps MP3 Audio Stream'],
    faqs: [
      {
        question: 'Can I extract audio from TikTok videos?',
        answer: 'Yes, VidFetch allows extracting audio tracks from permitted TikTok videos into MP3 files.',
      },
    ],
  },
  'generic-web': {
    id: 'generic-web',
    name: 'Web Media',
    tagline: 'Download Direct Web Media Streams',
    description: 'Analyze direct public HTML5 MP4 and WebM video stream links across the web.',
    howItWorks: 'Enter any valid public HTTP/HTTPS media stream URL to analyze available formats.',
    supportedFormatsList: ['720p MP4 Video Stream', '128 kbps MP3 Audio Stream'],
    faqs: [
      {
        question: 'Which websites are supported by the Web Media tool?',
        answer: 'Any standard public web page containing accessible HTML5 MP4 or WebM video streams can be processed.',
      },
    ],
  },
};

export async function generateMetadata({ params }: { params: { platform: string } }): Promise<Metadata> {
  const platformKey = params.platform.toLowerCase();
  const platform = PLATFORM_DETAILS[platformKey];

  if (!platform) {
    return constructMetadata({ title: 'Platform Not Found | VidFetch', noindex: true });
  }

  return constructMetadata({
    title: `${platform.name} Video Downloader – Save ${platform.name} Videos | VidFetch`,
    description: platform.description,
    canonical: `/platforms/${platformKey}`,
  });
}

export default function PlatformPage({ params }: { params: { platform: string } }) {
  const platformKey = params.platform.toLowerCase();
  const platform = PLATFORM_DETAILS[platformKey];

  if (!platform) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Tools', href: '/video-downloader' },
    { name: `${platform.name} Downloader`, href: `/platforms/${platformKey}` },
  ];

  const relatedLinks = getRelatedLinks('video-downloader');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `VidFetch ${platform.name} Downloader`,
    url: `${siteConfig.url}/platforms/${platformKey}`,
    description: platform.description,
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
              {platform.name} Video Downloader
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {platform.tagline}
            </p>
          </div>
          <VideoUrlInput />
        </HeroSection>

        <AdSlot slotId={`platform-${platformKey}-top`} format="leaderboard" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How to Download {platform.name} Content</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {platform.howItWorks}
            </p>
            <div className="pt-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Available Formats for {platform.name}</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {platform.supportedFormatsList.map((f, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                    • {f}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <RelatedTools title="More Downloader Tools" links={relatedLinks} />

          <FAQSection items={platform.faqs} title={`${platform.name} Downloader FAQ`} />

          <LegalNotice />
        </div>
      </div>
    </>
  );
}
