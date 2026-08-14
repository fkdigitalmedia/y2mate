import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">
                y2
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white font-mono lowercase">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Simple online video tools. Convert and download online video and audio streams.
            </p>
          </div>

          {/* Tools Col */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-[11px]">
              Downloader Tools
            </span>
            <ul className="space-y-2">
              {siteConfig.footerLinks.tools.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Formats Col */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-[11px]">
              Format Guides
            </span>
            <ul className="space-y-2">
              {siteConfig.footerLinks.formats.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Col */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-[11px]">
              Legal & Support
            </span>
            <ul className="space-y-2">
              {siteConfig.footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 {siteConfig.name}. Simple online video tools.</p>
          <p>{siteConfig.legalNotice}</p>
        </div>
      </div>
    </footer>
  );
}
