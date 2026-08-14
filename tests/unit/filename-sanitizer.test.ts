import { describe, it, expect } from 'vitest';
import { sanitizeFilename, sanitizeObjectKey } from '../../worker/src/utils/filename-sanitizer';

describe('Filename Sanitizer', () => {
  it('strips path separators, colons, and control characters', () => {
    const rawTitle = 'My Video: Episode 01 / Special Edition! \x07 \n';
    const safeName = sanitizeFilename(rawTitle, 'mp4');
    expect(safeName).toBe('My-Video-Episode-01-Special-Edition.mp4');
  });

  it('prevents dangerous executable extensions', () => {
    const safeName = sanitizeFilename('Test File', 'exe');
    expect(safeName).toBe('Test-File.bin');
  });

  it('generates sanitized object keys without path traversal vulnerability', () => {
    const key = sanitizeObjectKey('../../etc/passwd_job123', 'mp4');
    expect(key).toBe('downloads/etcpasswd_job123/result.mp4');
  });
});
