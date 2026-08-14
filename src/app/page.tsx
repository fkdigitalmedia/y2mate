'use client';

import React, { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import VideoUrlInput from '@/components/VideoUrlInput';
import MediaResultCard from '@/components/MediaResultCard';
import ProgressModal from '@/components/ProgressModal';
import HowItWorks from '@/components/HowItWorks';
import SupportedFormats from '@/components/SupportedFormats';
import Features from '@/components/Features';
import FAQSection from '@/components/FAQSection';
import LegalNotice from '@/components/LegalNotice';
import AdSlot from '@/components/AdSlot';
import RelatedTools from '@/components/RelatedTools';
import { MediaResult, MediaFormat } from '@/lib/media/types';
import { siteConfig } from '@/config/site';
import { getRelatedLinks } from '@/lib/internal-links';

export default function HomePage() {
  const [analyzedData, setAnalyzedData] = useState<MediaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | null>(null);

  const relatedLinks = getRelatedLinks('homepage');

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setAnalyzedData(null);
  };

  const handleAnalysisSuccess = (data: MediaResult) => {
    setIsLoading(false);
    setAnalyzedData(data);

    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-12 pb-16">
        {/* Hero & Downloader Input */}
        <HeroSection>
          <VideoUrlInput
            isLoading={isLoading}
            onAnalysisStart={handleAnalysisStart}
            onAnalysisSuccess={handleAnalysisSuccess}
          />
        </HeroSection>

        {/* Ad Placement below hero */}
        <AdSlot slotId="hero-bottom-leaderboard" format="leaderboard" />

        {/* Analyzed Media Result Card */}
        {analyzedData && (
          <section id="result-section" className="px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            <MediaResultCard
              metadata={analyzedData}
              onSelectFormat={(format) => setSelectedFormat(format)}
            />
          </section>
        )}

        {/* Download Progress Modal Popup */}
        {selectedFormat && analyzedData && (
          <ProgressModal
            format={selectedFormat}
            videoTitle={analyzedData.title}
            mediaId={analyzedData.id}
            url={analyzedData.url}
            onClose={() => setSelectedFormat(null)}
          />
        )}

        {/* How It Works Section */}
        <HowItWorks />

        {/* Internal Link Hub */}
        <div className="px-4 sm:px-6 lg:px-8">
          <RelatedTools title="Downloader Tools & Format Guides" links={relatedLinks} />
        </div>

        {/* Supported Formats Section */}
        <SupportedFormats />

        {/* Features Section */}
        <Features />

        {/* FAQ Accordion Section */}
        <FAQSection />

        {/* Ad Placement before legal notice */}
        <AdSlot slotId="content-bottom-banner" format="rectangle" />

        {/* Content Ownership & Legal Disclaimer Notice */}
        <div className="px-4 sm:px-6 lg:px-8">
          <LegalNotice />
        </div>
      </div>
    </>
  );
}
