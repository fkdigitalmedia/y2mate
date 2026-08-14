'use client';

import React, { useState, useRef } from 'react';
import { Search, Clipboard, X, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MediaMetadata } from '@/types';
import { trackEvent } from '@/lib/analytics';

interface VideoUrlInputProps {
  onAnalysisSuccess?: (data: MediaMetadata) => void;
  onAnalysisStart?: () => void;
  isLoading?: boolean;
}

export default function VideoUrlInput({
  onAnalysisSuccess,
  onAnalysisStart,
  isLoading = false,
}: VideoUrlInputProps) {
  const [url, setUrl] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastedNotice, setPastedNotice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeLoading = isLoading || internalLoading;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError(null);
        setPastedNotice(true);
        setTimeout(() => setPastedNotice(false), 2000);
      }
    } catch (err) {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a video URL.');
      return;
    }

    setError(null);
    setInternalLoading(true);
    if (onAnalysisStart) onAnalysisStart();

    trackEvent('url_submit');
    trackEvent('analysis_started');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'We couldn\'t analyze this URL. Please try again.');
        trackEvent('analysis_failed');
        return;
      }

      trackEvent('analysis_success');
      if (onAnalysisSuccess) {
        onAnalysisSuccess(json.data);
      }
    } catch (err: any) {
      setError('Something went wrong while processing this video. Please try again.');
      trackEvent('analysis_failed');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleQuickSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none focus-within:border-brand-500 dark:focus-within:border-brand-500 transition-all duration-200">
          {/* Input field */}
          <div className="relative flex-1 flex items-center min-h-[52px]">
            <Search className="w-5 h-5 ml-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste video or audio link here (e.g. YouTube, Vimeo, TikTok)..."
              disabled={activeLoading}
              className="w-full h-full pl-3 pr-10 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base font-medium focus:outline-none disabled:opacity-60"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear input"
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95"
              >
                {pastedNotice ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Pasted!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Paste</span>
                  </>
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={activeLoading || !url.trim()}
              className="flex-1 sm:flex-initial px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-base shadow-lg shadow-brand-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px]"
            >
              {activeLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error notification banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick sample link chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-400 dark:text-slate-500">Try sample:</span>
        <button
          onClick={() => handleQuickSample('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          YouTube HD Video
        </button>
        <button
          onClick={() => handleQuickSample('https://vimeo.com/76979871')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          Vimeo Short Film
        </button>
      </div>
    </div>
  );
}
