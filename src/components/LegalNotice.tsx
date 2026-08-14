'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function LegalNotice() {
  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3 text-left">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-white">
            Content Ownership & Usage Policy
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {siteConfig.legalNotice}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
        <span className="text-slate-400">Respect copyright laws & platform terms</span>
        <div className="flex items-center gap-4 text-slate-300 font-semibold">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/copyright" className="hover:underline">
            Copyright Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
