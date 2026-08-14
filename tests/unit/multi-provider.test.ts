import { describe, it, expect, beforeEach } from 'vitest';
import { circuitBreaker } from '@/lib/media/providers/circuit-breaker';
import { providerRegistry } from '@/lib/media/providers/registry';
import { FormatNormalizer } from '@/lib/media/format-normalizer';
import { normalizeMediaUrl } from '@/lib/media/url-normalizer';
import { MediaFormat } from '@/lib/media/types';

describe('Phase 8 Multi-Provider Architecture & Circuit Breaker', () => {
  beforeEach(() => {
    // Reset test state
  });

  it('selects highest priority healthy provider for YouTube', () => {
    const provider = providerRegistry.selectProvider('youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(provider).not.toBeNull();
    expect(provider?.id).toBe('youtube-primary');
    expect(provider?.priority).toBe(100);
  });

  it('opens circuit breaker after 3 consecutive failures', () => {
    const testProviderId = 'youtube-primary';
    expect(circuitBreaker.canExecute(testProviderId)).toBe(true);

    circuitBreaker.recordFailure(testProviderId);
    circuitBreaker.recordFailure(testProviderId);
    circuitBreaker.recordFailure(testProviderId);

    const metrics = circuitBreaker.getMetrics(testProviderId);
    expect(metrics.circuitState).toBe('OPEN');
    expect(metrics.status).toBe('UNAVAILABLE');
    expect(circuitBreaker.canExecute(testProviderId)).toBe(false);

    // Record success to reset circuit
    circuitBreaker.recordSuccess(testProviderId);
    expect(circuitBreaker.canExecute(testProviderId)).toBe(true);
  });

  it('normalizes URLs and strips tracking parameters', () => {
    const raw = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=twitter&fbclid=123';
    const norm = normalizeMediaUrl(raw);

    expect(norm.domain).toBe('youtube.com');
    expect(norm.normalizedUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('sorts and filters formats correctly', () => {
    const rawFormats: MediaFormat[] = [
      { id: '1', type: 'video', extension: 'mp4', mimeType: 'video/mp4', quality: '720p HD', downloadable: true, requiresProcessing: false },
      { id: '2', type: 'video', extension: 'mp4', mimeType: 'video/mp4', quality: '1080p Full HD', downloadable: true, requiresProcessing: false },
      { id: '3', type: 'audio', extension: 'mp3', mimeType: 'audio/mpeg', quality: '128 kbps', bitrate: '128 kbps', downloadable: true, requiresProcessing: true },
      { id: '4', type: 'audio', extension: 'mp3', mimeType: 'audio/mpeg', quality: '320 kbps', bitrate: '320 kbps', downloadable: true, requiresProcessing: true },
      { id: '5', type: 'video', extension: 'mp4', mimeType: 'video/mp4', quality: '720p HD', downloadable: true, requiresProcessing: false }, // Duplicate
    ];

    const filtered = FormatNormalizer.filterFormats(rawFormats);
    const sorted = FormatNormalizer.sortFormats(filtered);

    expect(filtered.length).toBe(4); // Duplicate removed
    expect(sorted[0].quality).toBe('1080p Full HD'); // Video 1080p first
    expect(sorted[2].quality).toBe('320 kbps'); // Audio 320k first
  });
});
