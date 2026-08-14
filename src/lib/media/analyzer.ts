import { MediaResult } from './types';
import { validateAndSanitizeUrl } from './validator';
import { platformRegistry } from './platforms';
import { providerRegistry } from './providers/registry';
import { circuitBreaker } from './providers/circuit-breaker';
import { FormatNormalizer } from './format-normalizer';
import { normalizeMediaUrl } from './url-normalizer';
import { MediaEngineError } from './errors';
import { settingsService } from '@/lib/settings/settings-service';

// Recent media analysis cache for server-side formatId verification
const mediaCache = new Map<string, MediaResult>();

export class MediaAnalyzerService {
  private static instance: MediaAnalyzerService;

  public static getInstance(): MediaAnalyzerService {
    if (!MediaAnalyzerService.instance) {
      MediaAnalyzerService.instance = new MediaAnalyzerService();
    }
    return MediaAnalyzerService.instance;
  }

  public async analyze(rawUrl: string): Promise<MediaResult> {
    // Step 1: Check Maintenance Mode
    const maintenanceMode = await settingsService.getSetting('maintenance_mode', false);
    if (maintenanceMode) {
      throw new MediaEngineError('TEMPORARY_ERROR', 'y2mate is currently undergoing scheduled maintenance. Please try again shortly.', 503);
    }

    // Step 2: Validate & Normalize URL
    const validation = validateAndSanitizeUrl(rawUrl);
    const normalized = normalizeMediaUrl(validation.sanitizedUrl);

    // Step 3: Match Platform
    const platformProvider = platformRegistry.getProviderForDomain(normalized.domain);
    if (!platformProvider) {
      throw new MediaEngineError('UNSUPPORTED_PLATFORM', 'This platform is not currently supported.', 400);
    }

    // Check Dynamic Admin Platform Enable/Disable
    const disabledPlatforms = await settingsService.getSetting<string[]>('disabled_platforms', []);
    if (!platformProvider.enabled || disabledPlatforms.includes(platformProvider.id)) {
      throw new MediaEngineError('PLATFORM_DISABLED', 'This platform is temporarily unavailable.', 403);
    }

    // Step 4: Provider Selection & Fallback Engine (Max 2 Attempts)
    const candidateProviders = providerRegistry.getProvidersForPlatform(platformProvider.id);
    const selectedProvider = providerRegistry.selectProvider(platformProvider.id, normalized.normalizedUrl);

    if (!selectedProvider) {
      throw new MediaEngineError('PROVIDER_UNAVAILABLE', 'Media processing provider is temporarily unavailable. Please try again shortly.', 503);
    }

    let lastError: any = null;
    let result: MediaResult | null = null;
    let attemptCount = 0;

    // Try selected provider, then fallback candidate if available
    const providersToTry = [selectedProvider, ...candidateProviders.filter((p) => p.id !== selectedProvider.id)].slice(0, 2);

    for (const provider of providersToTry) {
      attemptCount++;
      const startTime = Date.now();

      try {
        const analysisPromise = provider.analyze(rawUrl, normalized.normalizedUrl);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new MediaEngineError('TEMPORARY_ERROR', 'Provider response timed out (30s limit).', 504)), 30000)
        );

        result = await Promise.race([analysisPromise, timeoutPromise]);
        const durationMs = Date.now() - startTime;

        circuitBreaker.recordSuccess(provider.id, durationMs);
        console.log(`[MULTI_PROVIDER] Analysis succeeded using provider ${provider.id} (Attempt ${attemptCount}, ${durationMs}ms)`);
        break; // Success! Exit attempt loop
      } catch (err: any) {
        circuitBreaker.recordFailure(provider.id);
        lastError = err;
        console.warn(`[MULTI_PROVIDER] Provider ${provider.id} failed on attempt ${attemptCount}: ${err.message}`);
      }
    }

    if (!result) {
      throw lastError || new MediaEngineError('TEMPORARY_ERROR', 'All media processing providers failed to analyze this URL.', 500);
    }

    // Step 5: Format Normalization, Sorting & Deduplication
    const filteredFormats = FormatNormalizer.filterFormats(result.formats);
    result.formats = FormatNormalizer.sortFormats(filteredFormats);

    // Store in cache for formatId verification
    mediaCache.set(result.id, result);
    mediaCache.set(normalized.normalizedUrl, result);

    return result;
  }

  public getCachedMedia(mediaIdOrUrl: string): MediaResult | null {
    return mediaCache.get(mediaIdOrUrl) || null;
  }
}

export const mediaAnalyzer = MediaAnalyzerService.getInstance();
