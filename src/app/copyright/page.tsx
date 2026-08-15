import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Copyright & DMCA Policy | y2matevideo.com',
  description: 'Copyright compliance notice and DMCA takedown request guidelines for y2matevideo.com.',
};

export default function CopyrightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Copyright & DMCA Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: August 2026
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Respect for Intellectual Property</h2>
          <p>
            y2matevideo.com respects the intellectual property rights of creators and copyright owners. We expect all users of our web service to comply with applicable copyright laws (including the Digital Millennium Copyright Act - DMCA).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Content Responsibility Disclaimer</h2>
          <p>
            y2matevideo.com operates as a client-side and media-pass-through analysis utility. We do not host, store, catalog, or publish copyrighted video files on our infrastructure. All media content remains hosted exclusively on the original source platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Submitting a DMCA Takedown Notice / Domain Block Request</h2>
          <p>
            If you are a copyright holder or an authorized representative and wish to request domain-level blocking or filtering of URLs hosted on your platform, please submit a written request containing:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Identification of the copyrighted work or platform domain.</li>
            <li>Direct link to the content or domain policy.</li>
            <li>Your contact details (email address and phone number).</li>
            <li>A statement of good faith belief that the material is unauthorized.</li>
          </ul>
          <p>
            Please send all copyright notices to our team via the{' '}
            <Link href="/contact" className="text-brand-600 dark:text-brand-400 underline font-semibold">
              Contact Form
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
