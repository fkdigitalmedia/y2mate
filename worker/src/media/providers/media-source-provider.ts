import fs from 'fs';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { workerConfig } from '../../config';
import { validateAndSanitizeUrl } from '@/lib/media/validator';
import { Logger } from '../../utils/logger';
import { MediaFormat } from '../../types';

export interface PreparedMediaSource {
  streamUrl: string;
  contentType: string;
  expectedSize?: number;
  headers?: Record<string, string>;
}

export interface MediaSourceProvider {
  id: string;
  name: string;
  domains: string[];
  analyze(url: string): Promise<any>;
  prepareDownload(url: string, format: MediaFormat): Promise<PreparedMediaSource>;
  downloadStream(streamUrl: string, targetFilePath: string, onProgress?: (bytesRead: number) => void): Promise<number>;
}

export class DefaultMediaSourceProvider implements MediaSourceProvider {
  id = 'default-permitted-provider';
  name = 'Permitted Media Source';
  domains = [];

  async analyze(url: string): Promise<any> {
    const validation = validateAndSanitizeUrl(url);
    return {
      url: validation.sanitizedUrl,
      domain: validation.domain,
    };
  }

  async prepareDownload(url: string, format: MediaFormat): Promise<PreparedMediaSource> {
    // 1. SSRF & Domain Validation
    const validation = validateAndSanitizeUrl(url);

    // 2. Return validated downloadable media stream target
    return {
      streamUrl: validation.sanitizedUrl,
      contentType: format.mimeType || 'video/mp4',
    };
  }

  /**
   * Streaming HTTP downloader enforcing content size limits and request timeouts.
   * Prevents loading full media payload into RAM.
   */
  async downloadStream(
    streamUrl: string,
    targetFilePath: string,
    onProgress?: (bytesRead: number) => void
  ): Promise<number> {
    const maxBytes = workerConfig.maxInputFileSizeMb * 1024 * 1024;
    const timeoutMs = 30000; // 30s connection/download header timeout

    return new Promise<number>((resolve, reject) => {
      const parsedUrl = new URL(streamUrl);
      const httpModule = parsedUrl.protocol === 'https:' ? https : http;

      const req = httpModule.get(streamUrl, { timeout: timeoutMs }, (res) => {
        // Handle HTTP redirects (301, 302, 307)
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, streamUrl).toString();
          return this.downloadStream(redirectUrl, targetFilePath, onProgress).then(resolve).catch(reject);
        }

        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          return reject(new Error(`NETWORK_ERROR: HTTP ${res.statusCode} downloading media source.`));
        }

        const contentLength = parseInt(res.headers['content-length'] || '0', 10);
        if (contentLength > maxBytes) {
          req.destroy();
          return reject(new Error(`FILE_TOO_LARGE: Media file size (${Math.round(contentLength / 1024 / 1024)}MB) exceeds limit of ${workerConfig.maxInputFileSizeMb}MB.`));
        }

        const fileStream = fs.createWriteStream(targetFilePath);
        let bytesDownloaded = 0;

        res.on('data', (chunk: Buffer) => {
          bytesDownloaded += chunk.length;
          if (bytesDownloaded > maxBytes) {
            req.destroy();
            fileStream.destroy();
            try {
              if (fs.existsSync(targetFilePath)) fs.unlinkSync(targetFilePath);
            } catch {}
            return reject(new Error(`FILE_TOO_LARGE: Download exceeded size limit of ${workerConfig.maxInputFileSizeMb}MB.`));
          }

          if (onProgress) {
            onProgress(bytesDownloaded);
          }
        });

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => resolve(bytesDownloaded));
        });

        fileStream.on('error', (err) => {
          try {
            if (fs.existsSync(targetFilePath)) fs.unlinkSync(targetFilePath);
          } catch {}
          reject(err);
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('NETWORK_ERROR: Connection timed out downloading media source.'));
      });

      req.on('error', (err) => {
        reject(new Error(`NETWORK_ERROR: ${err.message}`));
      });
    });
  }
}

export const mediaSourceProvider = new DefaultMediaSourceProvider();
