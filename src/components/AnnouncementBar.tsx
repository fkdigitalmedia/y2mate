'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, X, ArrowRight } from 'lucide-react';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<{
    enabled: boolean;
    message: string;
    url: string;
  } | null>(null);

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.settings) {
          if (json.settings.announcement_enabled) {
            setAnnouncement({
              enabled: true,
              message: json.settings.announcement_message || 'Welcome to VidFetch!',
              url: json.settings.announcement_url || '/video-downloader',
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || !announcement.enabled || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-1 text-center">
        <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
        <span>{announcement.message}</span>
        {announcement.url && (
          <Link
            href={announcement.url}
            className="underline underline-offset-2 hover:opacity-80 flex items-center gap-1 font-bold ml-1"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="p-1 hover:bg-white/20 rounded-md transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
