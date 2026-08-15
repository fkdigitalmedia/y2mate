import React from 'react';
import type { Metadata } from 'next';
import SupportedFormats from '@/components/SupportedFormats';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import LegalNotice from '@/components/LegalNotice';
import { constructMetadata } from '@/config/seo';
import { getRelatedLinks } from '@/lib/internal-links';

export const metadata: Metadata = constructMetadata({
  title: 'Supported Video & Audio Media Formats | y2matevideo.com',
  description: 'Explore supported video and audio formats including MP4, MP3, WebM, and M4A with bitrate and resolution details.',
  canonical: '/formats',
});

export default function FormatsPage() {
  const breadcrumbs = [{ name: 'Formats', href: '/formats' }];
  const relatedLinks = getRelatedLinks('formats');

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Supported Formats & Resolutions
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          y2matevideo.com detects and presents all available video resolutions and audio quality options provided by source platforms.
        </p>
      </div>

      <SupportedFormats />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <RelatedTools title="Technical Format Deep Dives" links={relatedLinks} />
        <LegalNotice />
      </div>
    </div>
  );
}
