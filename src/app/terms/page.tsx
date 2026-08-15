import React from 'react';

export const metadata = {
  title: 'Terms of Service | y2matevideo.com',
  description: 'Terms of Service and legal usage policy for the y2matevideo.com online media downloader service.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: August 2026
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the y2matevideo.com web application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. User Responsibility & Permitted Use</h2>
          <p>
            y2matevideo.com provides a technical media analysis tool. Users are strictly required to only process and download content that they own, have explicit written permission to download, or content that the source/platform explicitly makes available for public download.
          </p>
          <p>
            You agree not to use y2matevideo.com for unauthorized download of copyright-protected material or in violation of applicable laws or third-party platform terms of service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Disclaimer of Ownership & Liability</h2>
          <p>
            y2matevideo.com does not store, host, or claim ownership over any external media files analyzed through the tool. All media titles, thumbnails, and files remain the intellectual property of their respective creators and source platforms.
          </p>
          <p>
            y2matevideo.com is provided &quot;as is&quot; without warranty of any kind. We are not liable for any damages resulting from your use of the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Modifications to Service</h2>
          <p>
            We reserve the right to modify, suspend, or terminate access to the service or any platform connector at any time without prior notice.
          </p>
        </section>
      </div>
    </div>
  );
}
