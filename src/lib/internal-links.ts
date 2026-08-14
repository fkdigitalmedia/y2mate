export interface InternalLinkItem {
  title: string;
  href: string;
  description: string;
  category: 'tool' | 'format' | 'guide' | 'platform';
}

export const internalLinksRegistry: Record<string, InternalLinkItem[]> = {
  homepage: [
    { title: 'Online Video Downloader', href: '/video-downloader', description: 'Analyze and extract web video formats', category: 'tool' },
    { title: 'MP3 Audio Extractor', href: '/mp3-downloader', description: 'Convert videos into 320kbps MP3 audio', category: 'tool' },
    { title: 'MP4 Downloader', href: '/mp4-downloader', description: 'Universal HD video container downloader', category: 'tool' },
    { title: 'Video to Audio', href: '/video-to-audio', description: 'Extract audio streams from video links', category: 'tool' },
    { title: 'MP4 Format Guide', href: '/formats/mp4', description: 'Understanding MP4 video codecs and specs', category: 'format' },
  ],
  'video-downloader': [
    { title: 'MP3 Audio Extractor', href: '/mp3-downloader', description: 'Convert video streams directly into MP3', category: 'tool' },
    { title: 'MP4 Video Downloader', href: '/mp4-downloader', description: 'Universal video container downloads', category: 'tool' },
    { title: 'Video Converter', href: '/video-converter', description: 'Convert between video and audio formats', category: 'tool' },
    { title: 'How to Download Videos', href: '/guides/how-to-download-online-videos', description: 'Step-by-step video downloading tutorial', category: 'guide' },
  ],
  'mp3-downloader': [
    { title: 'Video to Audio', href: '/video-to-audio', description: 'Extract audio from supported video links', category: 'tool' },
    { title: 'MP4 Downloader', href: '/mp4-downloader', description: 'Download HD MP4 video streams', category: 'tool' },
    { title: 'MP3 Format Guide', href: '/formats/mp3', description: 'MP3 bitrates and quality options', category: 'format' },
    { title: 'Video to MP3 Guide', href: '/guides/video-to-mp3', description: 'High-quality audio extraction guide', category: 'guide' },
  ],
  'mp4-downloader': [
    { title: 'Video Downloader', href: '/video-downloader', description: 'Full featured video link analyzer', category: 'tool' },
    { title: 'MP3 Downloader', href: '/mp3-downloader', description: 'Extract high quality MP3 audio', category: 'tool' },
    { title: 'MP4 Format Guide', href: '/formats/mp4', description: 'MP4 resolution and codec compatibility', category: 'format' },
    { title: 'Video Quality Explained', href: '/guides/video-quality-explained', description: 'Comparing 720p, 1080p, and 4K resolutions', category: 'guide' },
  ],
  formats: [
    { title: 'MP4 Format Guide', href: '/formats/mp4', description: 'Universal H.264 / AAC video container', category: 'format' },
    { title: 'MP3 Format Guide', href: '/formats/mp3', description: 'High quality audio stream container', category: 'format' },
    { title: 'M4A Format Guide', href: '/formats/m4a', description: 'AAC audio container for Apple devices', category: 'format' },
    { title: 'WebM Format Guide', href: '/formats/webm', description: 'Open HTML5 WebM video format', category: 'format' },
  ],
};

export function getRelatedLinks(pageKey: string): InternalLinkItem[] {
  return internalLinksRegistry[pageKey] || internalLinksRegistry.homepage;
}
