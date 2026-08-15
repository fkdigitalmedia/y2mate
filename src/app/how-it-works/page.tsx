import React from 'react';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import LegalNotice from '@/components/LegalNotice';

export const metadata = {
  title: 'How It Works – Video Downloader Guide | y2matevideo.com',
  description: 'Learn how to paste video URLs, choose resolution qualities, and download MP4 or MP3 media with y2matevideo.com in three quick steps.',
};

export default function HowItWorksPage() {
  return (
    <div className="py-12 space-y-12">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          How to Download Videos Online
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          y2matevideo.com makes media extraction and conversion effortless. Follow our simple step-by-step guide below.
        </p>
      </div>

      <HowItWorks />

      <Features />

      <div className="px-4">
        <LegalNotice />
      </div>
    </div>
  );
}
