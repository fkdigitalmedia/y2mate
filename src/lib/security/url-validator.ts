export interface ValidationResult {
  isValid: boolean;
  errorCode?: 'EMPTY_URL' | 'MALFORMED_URL' | 'UNSUPPORTED_PROTOCOL' | 'SSRF_BLOCKED' | 'UNSUPPORTED_PLATFORM';
  errorMessage?: string;
  sanitizedUrl?: string;
  domain?: string;
}

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // Cloud Metadata Service IP
  '::1',
];

const PRIVATE_IP_REGEXES = [
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
];

export function validateVideoUrl(inputUrl: string): ValidationResult {
  const trimmed = inputUrl ? inputUrl.trim() : '';

  if (!trimmed) {
    return {
      isValid: false,
      errorCode: 'EMPTY_URL',
      errorMessage: 'Please enter a video URL.',
    };
  }

  let parsedUrl: URL;
  try {
    // Add default protocol if missing for user convenience
    const urlToParse = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsedUrl = new URL(urlToParse);
  } catch {
    return {
      isValid: false,
      errorCode: 'MALFORMED_URL',
      errorMessage: 'Please enter a valid URL.',
    };
  }

  // Must be HTTP or HTTPS
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return {
      isValid: false,
      errorCode: 'UNSUPPORTED_PROTOCOL',
      errorMessage: 'Only HTTP and HTTPS URLs are supported.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // SSRF Protection Check
  if (BLOCKED_HOSTS.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      isValid: false,
      errorCode: 'SSRF_BLOCKED',
      errorMessage: 'Access to internal network addresses is prohibited.',
    };
  }

  for (const regex of PRIVATE_IP_REGEXES) {
    if (regex.test(hostname)) {
      return {
        isValid: false,
        errorCode: 'SSRF_BLOCKED',
        errorMessage: 'Access to private IP ranges is prohibited.',
      };
    }
  }

  return {
    isValid: true,
    sanitizedUrl: parsedUrl.toString(),
    domain: hostname.replace(/^www\./, ''),
  };
}
