import type { Metadata } from 'next';

export const seoConfig = {
  siteName: 'y2mate',
  siteUrl: 'https://y2mate.us.cc',
  defaultTitle: 'Video Downloader - y2mate',
  defaultDescription: 'Download supported online videos in available video and audio formats with a simple and fast downloader.',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@y2mate',
  locale: 'en_US',
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
};

interface MetadataOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function constructMetadata({
  title = seoConfig.defaultTitle,
  description = seoConfig.defaultDescription,
  canonical = '/',
  ogImage = seoConfig.defaultImage,
  noindex = false,
}: MetadataOptions = {}): Metadata {
  const fullCanonical = canonical.startsWith('http')
    ? canonical
    : `${seoConfig.siteUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}`;

  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${seoConfig.siteUrl}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

  return {
    title,
    description,
    metadataBase: new URL(seoConfig.siteUrl),
    alternates: {
      canonical: fullCanonical,
    },
    openGraph: {
      title,
      description,
      url: fullCanonical,
      siteName: seoConfig.siteName,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: seoConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullOgImage],
      creator: seoConfig.twitterHandle,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
      },
    },
    verification: seoConfig.googleSiteVerification
      ? {
          google: seoConfig.googleSiteVerification,
        }
      : undefined,
  };
}
