'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vidfetch_analytics_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vidfetch_analytics_consent', 'granted');
    setIsVisible(false);
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem('vidfetch_analytics_consent', 'denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex-shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            Privacy & Cookies
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We use essential cookies to ensure basic functionality and optional anonymous analytics to measure performance.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              Necessary Only
            </button>
          </div>
        </div>
        <button
          onClick={handleDecline}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
