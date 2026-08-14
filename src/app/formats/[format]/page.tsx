import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import AdSlot from '@/components/AdSlot';
import FAQSection from '@/components/FAQSection';
import LegalNotice from '@/components/LegalNotice';
import { constructMetadata } from '@/config/seo';
import { getRelatedLinks } from '@/lib/internal-links';
import { siteConfig } from '@/config/site';

interface FormatDetail {
  id: string;
  name: string;
  category: 'video' | 'audio';
  mimeType: string;
  codecs: string;
  description: string;
  useCases: string[];
  advantages: string[];
  limitations: string[];
  compatibility: string;
  whenToChoose: string;
  faqs: { question: string; answer: string }[];
}

const FORMAT_DETAILS: Record<string, FormatDetail> = {
  mp4: {
    id: 'mp4',
    name: 'MP4 (MPEG-4 Part 14)',
    category: 'video',
    mimeType: 'video/mp4',
    codecs: 'H.264 / AVC, AAC Audio',
    description: 'MP4 is the most widely supported video container format on the internet. It combines high compression efficiency with crisp HD video quality.',
    useCases: [
      'Streaming video playback on smartphones, tablets, laptops, and smart TVs',
      'Saving videos for offline playback',
      'Editing in software like Premiere Pro, Final Cut, or DaVinci Resolve',
    ],
    advantages: [
      'Universal hardware and software decoding support across all OS platforms',
      'Excellent balance of file size and visual video quality',
      'Supports subtitle tracks and metadata',
    ],
    limitations: [
      'Older patent-encumbered codec container compared to modern royalty-free WebM/AV1',
    ],
    compatibility: '100% Compatible with iOS, Android, Windows, macOS, Linux, ChromeOS, Smart TVs',
    whenToChoose: 'Choose MP4 when you want guaranteed video playback on any device without codec installation.',
    faqs: [
      {
        question: 'Is MP4 supported on iPhone and iPad?',
        answer: 'Yes, MP4 with H.264 video and AAC audio is natively supported by Apple iOS Safari and QuickTime.',
      },
      {
        question: 'Does MP4 support 1080p resolution?',
        answer: 'Yes, MP4 easily supports resolutions from 360p up to 4K Ultra HD.',
      },
    ],
  },
  mp3: {
    id: 'mp3',
    name: 'MP3 (MPEG-1 Audio Layer III)',
    category: 'audio',
    mimeType: 'audio/mpeg',
    codecs: 'LAME MP3 Audio Encoder',
    description: 'MP3 is the universal standard format for digital audio files. It uses lossy compression to dramatically reduce audio file sizes while preserving listening quality.',
    useCases: [
      'Listening to music tracks, podcasts, and audiobooks on mobile devices',
      'Transferring audio to car head units and portable media players',
      'Storing large music libraries with low disk footprint',
    ],
    advantages: [
      'Supported by literally every digital audio playback device built since 1995',
      'Small file sizes (typically 1MB per minute at 128kbps)',
      'Rich ID3 tag metadata support (artist, album, title, artwork)',
    ],
    limitations: [
      'Lossy compression discards subtle high-frequency audio data compared to FLAC',
    ],
    compatibility: '100% Compatible with all computers, smartphones, car audio systems, and legacy MP3 players',
    whenToChoose: 'Choose MP3 when you want to convert videos into portable audio tracks for music playback.',
    faqs: [
      {
        question: 'What is the difference between 128 kbps and 320 kbps MP3?',
        answer: '320 kbps provides maximum MP3 audio quality with minimal compression loss, while 128 kbps produces smaller file sizes suited for mobile data savings.',
      },
    ],
  },
  m4a: {
    id: 'm4a',
    name: 'M4A (MPEG-4 Audio)',
    category: 'audio',
    mimeType: 'audio/mp4',
    codecs: 'AAC (Advanced Audio Coding)',
    description: 'M4A is an audio-only container encoding audio using Advanced Audio Coding (AAC). It provides superior audio clarity compared to MP3 at equivalent bitrates.',
    useCases: [
      'Apple Music, iTunes, and iOS voice memo playback',
      'High-fidelity mobile music streaming with low bitrate requirements',
    ],
    advantages: [
      'Better audio quality than MP3 at lower bitrates (e.g. 256kbps AAC beats 320kbps MP3)',
      'Native container format for Apple ecosystem',
    ],
    limitations: [
      'Slightly less compatible with very old standalone legacy car CD receivers than MP3',
    ],
    compatibility: 'Supported by Apple iOS, macOS, modern Android devices, Windows Media Player, VLC',
    whenToChoose: 'Choose M4A if you use Apple devices or want maximum audio fidelity per megabyte.',
    faqs: [
      {
        question: 'Is M4A better quality than MP3?',
        answer: 'Yes, AAC compression in M4A offers better sound reproduction than MP3 at equal or smaller file sizes.',
      },
    ],
  },
  webm: {
    id: 'webm',
    name: 'WebM (HTML5 Web Media)',
    category: 'video',
    mimeType: 'video/webm',
    codecs: 'VP8 / VP9 Video, Opus Audio',
    description: 'WebM is a royalty-free, open-source media file format designed for web video streaming inside HTML5 browsers.',
    useCases: [
      'HTML5 web video embedded streaming',
      'High efficiency web publishing in Chrome and Firefox browsers',
    ],
    advantages: [
      'Open-source and royalty-free technology',
      'Superior web compression efficiency with VP9 and AV1 codecs',
    ],
    limitations: [
      'May require third-party media players (like VLC) on older iOS QuickTime engines',
    ],
    compatibility: 'Supported natively by Google Chrome, Mozilla Firefox, Microsoft Edge, Opera, VLC',
    whenToChoose: 'Choose WebM for modern web browser streaming or desktop playback with VLC.',
    faqs: [
      {
        question: 'How do I play WebM videos?',
        answer: 'WebM files open natively in Google Chrome, Firefox, Edge, and universal media players like VLC.',
      },
    ],
  },
};

export async function generateMetadata({ params }: { params: { format: string } }): Promise<Metadata> {
  const formatKey = params.format.toLowerCase();
  const format = FORMAT_DETAILS[formatKey];

  if (!format) {
    return constructMetadata({ title: 'Format Not Found | VidFetch', noindex: true });
  }

  return constructMetadata({
    title: `${format.name} Format Guide – Use Cases & Specs | VidFetch`,
    description: format.description,
    canonical: `/formats/${formatKey}`,
  });
}

export default function FormatDetailPage({ params }: { params: { format: string } }) {
  const formatKey = params.format.toLowerCase();
  const format = FORMAT_DETAILS[formatKey];

  if (!format) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Formats', href: '/formats' },
    { name: format.name, href: `/formats/${formatKey}` },
  ];

  const relatedLinks = getRelatedLinks('formats');

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
            {format.category} Container Format
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {format.name}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {format.description}
          </p>
        </header>

        <AdSlot slotId="format-detail-top" format="leaderboard" />

        {/* Technical Specs Summary */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Technical Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">MIME Type</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white">{format.mimeType}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Codecs</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white">{format.codecs}</p>
            </div>
          </div>
        </section>

        {/* Use Cases & Compatibility */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Typical Use Cases</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              {format.useCases.map((uc, i) => (
                <li key={i}>{uc}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Key Advantages</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              {format.advantages.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="p-8 rounded-3xl bg-brand-500/10 border border-brand-500/20 space-y-3">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">When to Choose {format.name}</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {format.whenToChoose}
          </p>
        </section>

        <RelatedTools title="Explore Other Formats & Tools" links={relatedLinks} />

        <FAQSection items={format.faqs} title={`${format.name} FAQ`} />

        <LegalNotice />
      </div>
    </div>
  );
}
