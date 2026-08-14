import { MediaEngineError } from './errors';

export interface ServerValidationResult {
  isValid: boolean;
  sanitizedUrl: string;
  domain: string;
  hostname: string;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254',
  '::1',
  '[::1]',
]);

const PRIVATE_IP_PATTERNS = [
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
];

export function validateAndSanitizeUrl(rawUrl: string): ServerValidationResult {
  const trimmed = rawUrl ? rawUrl.trim() : '';

  if (!trimmed) {
    throw new MediaEngineError('INVALID_URL', 'Please enter a video URL.', 400);
  }

  // Reject raw IP or dangerous schemes immediately
  if (/^(file|gopher|ftp|javascript|data):/i.test(trimmed)) {
    throw new MediaEngineError('INVALID_URL', 'Unsupported or unsafe URL protocol.', 400);
  }

  let parsed: URL;
  try {
    const urlToParse = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(urlToParse);
  } catch {
    throw new MediaEngineError('INVALID_URL', 'Please enter a valid URL.', 400);
  }

  // Must be HTTPS (or HTTP if explicit, but normalized safely)
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new MediaEngineError('INVALID_URL', 'Only HTTP and HTTPS URLs are supported.', 400);
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF Checks
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new MediaEngineError('PRIVATE_CONTENT', 'Access to internal or private addresses is strictly prohibited.', 403);
  }

  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new MediaEngineError('PRIVATE_CONTENT', 'Access to private network IP ranges is prohibited.', 403);
    }
  }

  const domain = hostname.replace(/^www\./, '');

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
    domain,
    hostname,
  };
}
