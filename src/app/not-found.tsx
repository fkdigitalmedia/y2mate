import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { constructMetadata } from '@/config/seo';

export const metadata = constructMetadata({
  title: '404 - Page Not Found | y2matevideo.com',
  description: 'The page you are looking for does not exist or has been moved.',
  noindex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800 shadow-lg">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          404 Error
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          The requested page URL could not be found or may have been moved. Return to the homepage to analyze video URLs.
        </p>
      </div>

      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-600/25 flex items-center gap-2 transition-all duration-200 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Video Downloader</span>
      </Link>
    </div>
  );
}
