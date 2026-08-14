import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/video-downloader',
    '/mp3-downloader',
    '/mp4-downloader',
    '/video-to-audio',
    '/video-converter',
    '/formats',
    '/formats/mp4',
    '/formats/mp3',
    '/formats/m4a',
    '/formats/webm',
    '/guides/how-to-download-online-videos',
    '/guides/video-to-mp3',
    '/guides/video-formats-explained',
    '/guides/video-quality-explained',
    '/platforms/youtube',
    '/platforms/vimeo',
    '/platforms/tiktok',
    '/platforms/generic-web',
    '/pricing',
    '/how-it-works',
    '/faq',
    '/terms',
    '/privacy',
    '/copyright',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route.includes('downloader') || route === '/pricing' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.includes('downloader') || route === '/pricing' ? 0.9 : 0.8,
  }));
}
