export const siteConfig = {
  name: 'y2matevideo.com',
  tagline: 'Online Video Downloader',
  description: 'y2matevideo.com lets you analyze supported video URLs and choose available video or audio formats in a simple, mobile-friendly interface.',
  url: 'https://y2matevideo.com',
  domain: 'y2matevideo.com',
  ogImage: '/og-image.jpg',
  navLinks: [
    { name: 'Video Downloader', href: '/video-downloader' },
    { name: 'MP3 Downloader', href: '/mp3-downloader' },
    { name: 'MP4 Downloader', href: '/mp4-downloader' },
    { name: 'Converter', href: '/video-converter' },
    { name: 'Formats', href: '/formats' },
    { name: 'Pricing', href: '/pricing' },
  ],
  footerLinks: {
    tools: [
      { name: 'Video Downloader', href: '/video-downloader' },
      { name: 'MP3 Downloader', href: '/mp3-downloader' },
      { name: 'MP4 Downloader', href: '/mp4-downloader' },
      { name: 'Video to Audio', href: '/video-to-audio' },
      { name: 'Video Converter', href: '/video-converter' },
    ],
    formats: [
      { name: 'MP4 Format Guide', href: '/formats/mp4' },
      { name: 'MP3 Format Guide', href: '/formats/mp3' },
      { name: 'M4A Format Guide', href: '/formats/m4a' },
      { name: 'WebM Format Guide', href: '/formats/webm' },
    ],
    guides: [
      { name: 'How to Download Videos', href: '/guides/how-to-download-online-videos' },
      { name: 'Video to MP3 Guide', href: '/guides/video-to-mp3' },
      { name: 'Video Formats Explained', href: '/guides/video-formats-explained' },
      { name: 'Video Quality Explained', href: '/guides/video-quality-explained' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Copyright Policy', href: '/copyright' },
      { name: 'Contact Us', href: '/contact' },
    ],
  },
  supportedPlatforms: [
    { id: 'youtube', name: 'YouTube', domains: ['youtube.com', 'youtu.be'], supported: true },
    { id: 'vimeo', name: 'Vimeo', domains: ['vimeo.com'], supported: true },
    { id: 'tiktok', name: 'TikTok', domains: ['tiktok.com'], supported: true },
    { id: 'generic-web', name: 'Web Stream', domains: [], supported: true },
  ],
  supportedFormats: [
    { id: 'mp4', name: 'MP4', category: 'video', description: 'Universal video format compatible with all devices', badge: 'Popular' },
    { id: 'mp3', name: 'MP3', category: 'audio', description: 'High-quality audio extraction up to 320 kbps', badge: 'Audio' },
    { id: 'm4a', name: 'M4A', category: 'audio', description: 'AAC audio container for Apple and modern devices', badge: 'AAC' },
    { id: 'webm', name: 'WebM', category: 'video', description: 'Open-source HTML5 compressed web video format', badge: 'Web' },
  ],
  faqItems: [
    {
      question: 'How does y2matevideo.com analyze video URLs?',
      answer: 'y2matevideo.com checks the URL for permitted domains and retrieves available format metadata directly from public source streams.',
    },
    {
      question: 'Which formats and qualities can I choose?',
      answer: 'Available options depend on what the source stream provides. Common choices include 360p, 720p, 1080p MP4 videos and 128kbps or 320kbps MP3 audio.',
    },
    {
      question: 'Is video downloading handled on serverless functions?',
      answer: 'No. Downloader execution runs on an isolated background worker service with FFmpeg, preserving serverless performance and avoiding timeout limits.',
    },
    {
      question: 'How long do generated download links remain active?',
      answer: 'Signed object storage download links remain valid for approximately 30 minutes before being automatically purged during routine cleanup.',
    },
    {
      question: 'Do I need to sign up or pay to use y2matevideo.com?',
      answer: 'No account, registration, or subscription is required. y2matevideo.com is 100% free to use in any modern desktop or mobile browser.',
    },
  ],
  legalNotice: 'Please only download content you own or have permission to download. You are responsible for complying with applicable laws and platform terms.',
};
