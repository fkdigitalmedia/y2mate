import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { spawn } from 'child_process';
import { URL } from 'url';
import { workerConfig, resolveYtDlpExecutable } from '../../config';
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
  downloadStream(streamUrl: string, targetFilePath: string, onProgress?: (bytesRead: number) => void, format?: MediaFormat): Promise<number>;
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
   * Downloads real media stream using yt-dlp binary (if available on worker host)
   * or streaming HTTP downloader enforcing size limits and timeouts.
   */
  async downloadStream(
    streamUrl: string,
    targetFilePath: string,
    onProgress?: (bytesRead: number) => void,
    format?: MediaFormat
  ): Promise<number> {
    const ytDlpPath = resolveYtDlpExecutable();

    // If yt-dlp is available on worker host, download the real original upstream stream
    if (ytDlpPath) {
      Logger.info(`Executing yt-dlp stream extraction using ${ytDlpPath} for URL`, { ytDlpPath });

      const isAudio = format?.type === 'audio' || format?.extension === 'mp3' || format?.extension === 'm4a';
      const args: string[] = [
        '--no-warnings',
        '--no-playlist',
        '--no-check-certificates',
        '--prefer-free-formats',
        '--extractor-args', 'youtube:player_client=android,ios',
      ];

      // Automatically include cookies.txt if present for authenticated / bot-protected stream bypass
      const possibleCookiePaths = [
        process.env.COOKIES_PATH,
        path.join(process.cwd(), 'cookies.txt'),
        path.join(process.cwd(), 'cookies.json'),
        '/home/opc/y2mate/cookies.txt',
      ];
      for (const cp of possibleCookiePaths) {
        if (cp && fs.existsSync(cp)) {
          args.push('--cookies', cp);
          Logger.info(`Using yt-dlp cookies from ${cp}`);
          break;
        }
      }

      if (isAudio) {
        args.push('-x', '--audio-format', 'mp3', '-o', targetFilePath, streamUrl);
      } else {
        // Fetch requested resolution or best MP4 container
        let qualitySelector = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        if (format?.quality?.includes('1080')) {
          qualitySelector = 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best';
        } else if (format?.quality?.includes('720')) {
          qualitySelector = 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best';
        } else if (format?.quality?.includes('480')) {
          qualitySelector = 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best';
        } else if (format?.quality?.includes('360')) {
          qualitySelector = 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best';
        }

        args.push('-f', qualitySelector, '--merge-output-format', 'mp4', '-o', targetFilePath, streamUrl);
      }

      return new Promise<number>((resolve, reject) => {
        let child = spawn(ytDlpPath, args, { shell: false, windowsHide: true });
        let stderr = '';

        child.stdout?.on('data', (d) => {
          const str = d.toString();
          const match = str.match(/(\d+(?:\.\d+)?)%/);
          if (match && onProgress) {
            const pct = parseFloat(match[1]);
            onProgress(Math.floor(pct * 100000));
          }
        });

        child.stderr?.on('data', (d) => (stderr += d.toString()));

        child.on('close', (code) => {
          if (code === 0 && fs.existsSync(targetFilePath) && fs.statSync(targetFilePath).size > 1000) {
            const size = fs.statSync(targetFilePath).size;
            Logger.info(`yt-dlp stream download successful. Size: ${size} bytes`);
            return resolve(size);
          }

          Logger.warn(`yt-dlp execution returned code ${code}. Falling back to HTTP stream: ${stderr.slice(-200)}`);
          // Fallback to standard HTTP stream
          this.downloadHttpStream(streamUrl, targetFilePath, onProgress).then(resolve).catch(reject);
        });

        child.on('error', (err) => {
          Logger.warn(`yt-dlp spawn error: ${err.message}. Falling back to HTTP stream.`);
          this.downloadHttpStream(streamUrl, targetFilePath, onProgress).then(resolve).catch(reject);
        });
      });
    }

    return this.downloadHttpStream(streamUrl, targetFilePath, onProgress);
  }

  /**
   * Direct streaming HTTP downloader enforcing content size limits and request timeouts.
   */
  private async downloadHttpStream(
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

        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          req.destroy();
          return reject(new Error(`INVALID_MEDIA_TYPE: Remote URL returned HTML/JSON page (${contentType}) instead of media stream.`));
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
          fileStream.close(() => {
            if (contentLength > 0 && bytesDownloaded < contentLength * 0.95) {
              try {
                if (fs.existsSync(targetFilePath)) fs.unlinkSync(targetFilePath);
              } catch {}
              return reject(new Error(`STREAM_TRUNCATED: Received ${bytesDownloaded} bytes out of expected ${contentLength} bytes.`));
            }
            resolve(bytesDownloaded);
          });
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
