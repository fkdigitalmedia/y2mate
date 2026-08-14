/**
 * Safely normalizes media source URLs and performs strict domain matching.
 */
export function normalizeMediaUrl(rawUrl: string): {
  normalizedUrl: string;
  hostname: string;
  domain: string;
} {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Invalid URL format.');
  }

  // Enforce HTTP / HTTPS protocol only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Strip common marketing & tracking query parameters
  const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'ref'];
  trackingParams.forEach((param) => parsed.searchParams.delete(param));

  // Normalize path
  let path = parsed.pathname;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  const normalizedUrl = `${parsed.protocol}//${hostname}${path}${parsed.search}`;

  // Domain extraction (e.g. www.youtube.com -> youtube.com)
  const parts = hostname.split('.');
  const domain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;

  return {
    normalizedUrl,
    hostname,
    domain,
  };
}

/**
 * Strict domain match guard preventing fake substring matches (e.g. fake-youtube.com)
 */
export function matchesAllowedDomain(hostname: string, allowedDomains: string[]): boolean {
  const lowerHost = hostname.toLowerCase();

  return allowedDomains.some((domain) => {
    const lowerDomain = domain.toLowerCase();
    return lowerHost === lowerDomain || lowerHost.endsWith(`.${lowerDomain}`);
  });
}
