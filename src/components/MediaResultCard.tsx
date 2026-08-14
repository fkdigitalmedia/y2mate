'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Video, Music, Clock, Globe, Download, HardDrive } from 'lucide-react';
import { MediaResult, MediaFormat } from '@/lib/media/types';

interface MediaResultCardProps {
  metadata: MediaResult;
  onSelectFormat: (format: MediaFormat) => void;
}

export default function MediaResultCard({ metadata, onSelectFormat }: MediaResultCardProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  const videoFormats = metadata.formats.filter((f) => f.type === 'video');
  const audioFormats = metadata.formats.filter((f) => f.type === 'audio');

  const displayedFormats = activeTab === 'video' ? videoFormats : audioFormats;

  const formattedDuration = typeof metadata.duration === 'number'
    ? `${Math.floor(metadata.duration / 60).toString().padStart(2, '0')}:${(metadata.duration % 60).toString().padStart(2, '0')}`
    : metadata.duration;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left transition-all">
      {/* Header Info */}
      <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
            <Image
              src={metadata.thumbnail}
              alt={metadata.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
              unoptimized
            />
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-300" />
              <span>{formattedDuration}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Globe className="w-3 h-3" />
              <span>{metadata.platform}</span>
            </span>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
              {metadata.title}
            </h2>

            <p className="text-xs text-slate-500 font-mono truncate">
              {metadata.canonicalUrl}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Formats Selection */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
              activeTab === 'video'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>VIDEO ({videoFormats.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
              activeTab === 'audio'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>AUDIO ({audioFormats.length})</span>
          </button>
        </div>

        {/* Formats List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {displayedFormats.map((format) => (
            <div
              key={format.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs flex items-center justify-center uppercase text-slate-700 dark:text-slate-300">
                  {format.extension}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {format.quality}
                    </span>
                    {format.isPopular && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    {format.resolution && <span>{format.resolution}</span>}
                    {format.bitrate && <span>{format.bitrate}</span>}
                    {format.fileSize && <span>{format.fileSize}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectFormat(format)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
