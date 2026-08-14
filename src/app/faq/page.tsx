import React from 'react';
import FAQSection from '@/components/FAQSection';
import LegalNotice from '@/components/LegalNotice';

export const metadata = {
  title: 'Frequently Asked Questions – Help & Support | VidFetch',
  description: 'Answers to common questions about VidFetch video downloader, formats, audio extraction, and copyright compliance.',
};

export default function FAQPage() {
  return (
    <div className="py-12 space-y-12">
      <FAQSection />
      <div className="px-4">
        <LegalNotice />
      </div>
    </div>
  );
}
