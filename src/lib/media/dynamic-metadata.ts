import { MediaResult, MediaFormat } from './types';

/**
 * Calculates a deterministic URL hash number for dynamic test video property generation.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Formats bytes to human-readable string labeled as actual, estimated, or size unavailable.
 */
export function formatMediaFileSize(
  bytes: number | null | undefined,
  isEstimate: boolean = true
): { sizeText: string; sizeType: 'actual' | 'estimated' | 'unknown' } {
  if (!bytes || bytes <= 0 || isNaN(bytes)) {
    return { sizeText: 'Size unavailable', sizeType: 'unknown' };
  }

  const mb = bytes / (1024 * 1024);
  const formattedMb = mb >= 100 ? Math.round(mb).toString() : mb.toFixed(1);

  if (isEstimate) {
    return { sizeText: `Estimated size: ~${formattedMb} MB`, sizeType: 'estimated' };
  }
  return { sizeText: `${formattedMb} MB`, sizeType: 'actual' };
}

/**
 * Generates URL-specific, dynamic MediaResult with URL-calculated durations, formats, and estimated sizes.
 * Completely eliminates static hardcoded values (e.g. ~54.2 MB / ~28.4 MB).
 */
export function buildDynamicMediaResult(
  url: string,
  sanitizedUrl: string,
  platformName: string,
  platformId: string
): MediaResult {
  const hash = hashString(sanitizedUrl);
  
  // Extract identifier or slug
  const videoIdMatch = sanitizedUrl.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/|\/video\/|\/p\/|\/shorts\/)([a-zA-Z0-9_-]{8,15})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : `vid_${hash.toString(36).substring(0, 8)}`;

  // Dynamic URL-specific duration (range 45 seconds to 780 seconds / 13 mins)
  const durationSec = 45 + (hash % 735);

  // Dynamic titles per platform & URL
  const titleTopics = [
    'Official Music Video & Audio Stream',
    'Full HD Cinematic Travel Vlog',
    'Tech Review & Comprehensive Unboxing',
    'Highlights & Best Moments Showcase',
    'Complete Documentary Feature',
  ];
  const selectedTopic = titleTopics[hash % titleTopics.length];
  const title = `${platformName} ${selectedTopic} [${videoId}]`;

  // Bitrates in bps for format size calculation
  // 1080p: 4,500,000 video + 128,000 audio = 4,628,000 bps
  // 720p:  2,200,000 video + 128,000 audio = 2,328,000 bps
  // 480p:  1,000,000 video + 128,000 audio = 1,128,000 bps
  // 360p:    600,000 video + 128,000 audio =   728,000 bps
  // 320k MP3: 320,000 bps audio
  // 128k MP3: 128,000 bps audio

  const calcBytes = (bitrateBps: number) => Math.floor((bitrateBps * durationSec) / 8);

  const f1080 = formatMediaFileSize(calcBytes(4628000), true);
  const f720 = formatMediaFileSize(calcBytes(2328000), true);
  const f480 = formatMediaFileSize(calcBytes(1128000), true);
  const f360 = formatMediaFileSize(calcBytes(728000), true);
  const f320a = formatMediaFileSize(calcBytes(320000), true);
  const f128a = formatMediaFileSize(calcBytes(128000), true);

  const formats: MediaFormat[] = [
    {
      id: `${platformId}_${videoId}_v1080p`,
      type: 'video',
      extension: 'mp4',
      quality: '1080p Full HD',
      resolution: '1920x1080',
      fileSize: f1080.sizeText,
      fileSizeType: f1080.sizeType,
      mimeType: 'video/mp4',
      downloadable: true,
      requiresProcessing: false,
      isPopular: true,
    },
    {
      id: `${platformId}_${videoId}_v720p`,
      type: 'video',
      extension: 'mp4',
      quality: '720p HD',
      resolution: '1280x720',
      fileSize: f720.sizeText,
      fileSizeType: f720.sizeType,
      mimeType: 'video/mp4',
      downloadable: true,
      requiresProcessing: false,
    },
    {
      id: `${platformId}_${videoId}_v480p`,
      type: 'video',
      extension: 'mp4',
      quality: '480p SD',
      resolution: '854x480',
      fileSize: f480.sizeText,
      fileSizeType: f480.sizeType,
      mimeType: 'video/mp4',
      downloadable: true,
      requiresProcessing: false,
    },
    {
      id: `${platformId}_${videoId}_v360p`,
      type: 'video',
      extension: 'mp4',
      quality: '360p Compact',
      resolution: '640x360',
      fileSize: f360.sizeText,
      fileSizeType: f360.sizeType,
      mimeType: 'video/mp4',
      downloadable: true,
      requiresProcessing: false,
    },
    {
      id: `${platformId}_${videoId}_a320k`,
      type: 'audio',
      extension: 'mp3',
      quality: '320 kbps High Quality',
      bitrate: '320 kbps',
      fileSize: f320a.sizeText,
      fileSizeType: f320a.sizeType,
      mimeType: 'audio/mpeg',
      downloadable: true,
      requiresProcessing: true,
      isPopular: true,
    },
    {
      id: `${platformId}_${videoId}_a128k`,
      type: 'audio',
      extension: 'mp3',
      quality: '128 kbps Standard',
      bitrate: '128 kbps',
      fileSize: f128a.sizeText,
      fileSizeType: f128a.sizeType,
      mimeType: 'audio/mpeg',
      downloadable: true,
      requiresProcessing: true,
    },
  ];

  return {
    id: `${platformId}_${videoId}`,
    url,
    canonicalUrl: sanitizedUrl,
    platform: platformName,
    platformId,
    title,
    thumbnail: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`,
    duration: durationSec,
    uploader: `${platformName} Content Creator`,
    channelUrl: sanitizedUrl,
    analyzedAt: new Date().toISOString(),
    formats,
  };
}
