import { describe, it, expect } from 'vitest';
import { validateAndSanitizeUrl } from '../../src/lib/media/validator';

describe('SSRF & URL Security Validator', () => {
  it('allows valid public HTTPS video URLs', () => {
    const res = validateAndSanitizeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.domain).toBe('youtube.com');
  });

  it('rejects localhost and loopback IP addresses', () => {
    expect(() => validateAndSanitizeUrl('http://127.0.0.1/video.mp4')).toThrow();
    expect(() => validateAndSanitizeUrl('http://localhost:8080/media')).toThrow();
  });

  it('rejects cloud metadata IP addresses', () => {
    expect(() => validateAndSanitizeUrl('http://169.254.169.254/latest/meta-data')).toThrow();
  });

  it('rejects internal RFC1918 private network IP blocks', () => {
    expect(() => validateAndSanitizeUrl('http://192.168.1.1/video')).toThrow();
    expect(() => validateAndSanitizeUrl('http://10.0.0.5/stream')).toThrow();
  });
});
