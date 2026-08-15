/**
 * Safe filename generator for y2matevideo.com media processing.
 * Enforces path traversal prevention, control character stripping, length bounds,
 * and valid extension formatting.
 */

const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'php', 'js', 'vbs', 'ps1', 'jar', 'com', 'pif', 'scr', 'htm', 'html', 'asp', 'aspx', 'pl', 'cgi'
]);

export function sanitizeFilename(title: string, targetExtension: string): string {
  if (!title) {
    title = 'media_download';
  }

  // 1. Remove control characters & non-printable ASCII/Unicode controls
  let clean = title.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // 2. Replace path separators, colons, slashes, and reserved OS characters with hyphens
  clean = clean.replace(/[\\/:*?"<>|!@#$%^&*()=+[\]{};:',]+(?=\s|$)|[\\/:*?"<>|!@#$%^&*()=+[\]{};:',]+/g, '-');

  // 3. Replace multiple spaces or consecutive hyphens with single hyphen
  clean = clean.replace(/[\s\-_]+/g, '-').trim();

  // 4. Strip leading/trailing dots and hyphens
  clean = clean.replace(/^[.\-]+|[.\-]+$/g, '');

  if (!clean) {
    clean = 'download';
  }

  // 5. Enforce safe extension
  let ext = targetExtension ? targetExtension.toLowerCase().replace(/^\./, '') : 'mp4';
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    ext = 'bin';
  }

  // 6. Limit base filename length (max 100 characters for title base)
  if (clean.length > 100) {
    clean = clean.substring(0, 100).replace(/[.\-]+$/, '');
  }

  return `${clean}.${ext}`;
}

export function sanitizeObjectKey(jobId: string, extension: string): string {
  let ext = extension ? extension.toLowerCase().replace(/^\./, '') : 'mp4';
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    ext = 'bin';
  }
  const cleanJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `downloads/${cleanJobId}/result.${ext}`;
}
