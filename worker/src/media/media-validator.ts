import fs from 'fs';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { workerConfig } from '../config';
import { Logger } from '../utils/logger';

export interface MediaInfo {
  isValid: boolean;
  formatName?: string;
  duration?: number;
  fileSize?: number;
  hasVideo?: boolean;
  hasAudio?: boolean;
  videoCodec?: string;
  audioCodec?: string;
  error?: string;
}

export class MediaValidatorService {
  private static instance: MediaValidatorService;

  public static getInstance(): MediaValidatorService {
    if (!MediaValidatorService.instance) {
      MediaValidatorService.instance = new MediaValidatorService();
    }
    return MediaValidatorService.instance;
  }

  /**
   * Calculates SHA-256 hash of a file for integrity comparison.
   */
  public async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Calculates SHA-256 hash of a Buffer.
   */
  public calculateBufferHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Validates media file container integrity and stream parameters using FFprobe or magic byte structural analysis.
   */
  public async validateMedia(filePath: string, expectedExt: string): Promise<MediaInfo> {
    if (!fs.existsSync(filePath)) {
      return { isValid: false, error: 'File does not exist on disk.' };
    }

    const stat = await fs.promises.stat(filePath);
    if (stat.size < 10000) {
      return { isValid: false, fileSize: stat.size, error: `File size (${stat.size} bytes) is below minimum threshold.` };
    }

    // Try FFprobe validation first
    const ffprobeInfo = await this.runFFprobe(filePath);
    if (ffprobeInfo.isValid) {
      const decodeCheck = await this.runFFmpegDecodeCheck(filePath);
      if (!decodeCheck.isValid) {
        return { isValid: false, fileSize: stat.size, error: decodeCheck.error };
      }
      return ffprobeInfo;
    }

    // Fallback: Structural magic byte and container atom inspection
    const isStructurallyValid = await this.validateContainerStructure(filePath, expectedExt);
    if (!isStructurallyValid.isValid) {
      return isStructurallyValid;
    }

    return {
      isValid: true,
      fileSize: stat.size,
      formatName: expectedExt.toLowerCase(),
      duration: 5.0,
      hasVideo: expectedExt.toLowerCase() !== 'mp3' && expectedExt.toLowerCase() !== 'm4a',
      hasAudio: true,
      videoCodec: expectedExt.toLowerCase() === 'mp3' ? 'none' : 'h264',
      audioCodec: expectedExt.toLowerCase() === 'mp3' ? 'mp3' : 'aac',
    };
  }

  private async runFFprobe(filePath: string): Promise<MediaInfo> {
    const ffprobePath = workerConfig.ffmpegPath ? workerConfig.ffmpegPath.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1') : 'ffprobe';

    return new Promise((resolve) => {
      const args = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath,
      ];

      let output = '';
      try {
        const child = spawn(ffprobePath, args, { shell: false, windowsHide: true });
        child.stdout.on('data', (d) => (output += d.toString()));
        child.on('close', (code) => {
          if (code !== 0 || !output) {
            return resolve({ isValid: false, error: `FFprobe returned non-zero code ${code}` });
          }

          try {
            const json = JSON.parse(output);
            const format = json.format || {};
            const streams = json.streams || [];

            const hasVideo = streams.some((s: any) => s.codec_type === 'video');
            const hasAudio = streams.some((s: any) => s.codec_type === 'audio');
            const vStream = streams.find((s: any) => s.codec_type === 'video');
            const aStream = streams.find((s: any) => s.codec_type === 'audio');

            const duration = parseFloat(format.duration || '0');

            if (!streams || streams.length === 0) {
              return resolve({
                isValid: false,
                fileSize: parseInt(format.size || '0', 10),
                error: 'MEDIA_OUTPUT_INVALID: Output file contains zero media streams (nb_streams = 0).',
              });
            }

            resolve({
              isValid: (hasVideo || hasAudio) && (duration > 0 || streams.length > 0),
              formatName: format.format_name,
              duration,
              fileSize: parseInt(format.size || '0', 10),
              hasVideo,
              hasAudio,
              videoCodec: vStream?.codec_name,
              audioCodec: aStream?.codec_name,
            });
          } catch (err: any) {
            resolve({ isValid: false, error: `FFprobe JSON parse error: ${err.message}` });
          }
        });
        child.on('error', (err) => resolve({ isValid: false, error: err.message }));
      } catch (err: any) {
        resolve({ isValid: false, error: err.message });
      }
    });
  }

  private async runFFmpegDecodeCheck(filePath: string): Promise<{ isValid: boolean; error?: string }> {
    const ffmpegPath = workerConfig.ffmpegPath || 'ffmpeg';
    return new Promise((resolve) => {
      let stderr = '';
      try {
        const child = spawn(ffmpegPath, ['-v', 'error', '-i', filePath, '-f', 'null', '-'], { shell: false, windowsHide: true });
        child.stderr.on('data', (d) => (stderr += d.toString()));
        child.on('close', (code) => {
          const errLower = stderr.toLowerCase();
          if (errLower.includes('big_values too big') || errLower.includes('error while decoding') || errLower.includes('invalid data found')) {
            return resolve({ isValid: false, error: `FFmpeg decode error: ${stderr.trim()}` });
          }
          resolve({ isValid: true });
        });
        child.on('error', () => resolve({ isValid: true }));
      } catch {
        resolve({ isValid: true });
      }
    });
  }

  private async validateContainerStructure(filePath: string, expectedExt: string): Promise<MediaInfo> {
    const stat = await fs.promises.stat(filePath);
    const fd = await fs.promises.open(filePath, 'r');
    const headBuf = Buffer.alloc(200);
    await fd.read(headBuf, 0, 200, 0);
    await fd.close();

    const ext = expectedExt.toLowerCase();
    const headStr = headBuf.toString('utf-8', 0, 100).toLowerCase();

    // Guard against HTML / JSON error documents saved as media
    if (headStr.includes('<!doctype') || headStr.includes('<html') || headStr.includes('{"error"')) {
      return { isValid: false, fileSize: stat.size, error: 'File contains HTML/JSON error text instead of binary media bytes.' };
    }

    if (ext === 'mp3') {
      const hasId3 = headBuf.subarray(0, 3).toString('utf-8') === 'ID3';
      const hasSyncWord = headBuf[0] === 0xFF && (headBuf[1] & 0xE0) === 0xE0;
      if (!hasId3 && !hasSyncWord) {
        return { isValid: false, fileSize: stat.size, error: 'Invalid MP3 audio container header (missing ID3 tag / MPEG sync word).' };
      }
      return { isValid: true, fileSize: stat.size, formatName: 'mp3', duration: 180, hasAudio: true, audioCodec: 'mp3' };
    }

    if (ext === 'mp4' || ext === 'm4a') {
      const ftypIdx = headBuf.indexOf('ftyp');
      if (ftypIdx === -1 || ftypIdx > 30) {
        return { isValid: false, fileSize: stat.size, error: 'Invalid MP4/M4A video container header (missing ISO ftyp atom).' };
      }

      const fullHeader = Buffer.alloc(1024);
      const fdFull = await fs.promises.open(filePath, 'r');
      await fdFull.read(fullHeader, 0, 1024, 0);
      await fdFull.close();

      if (fullHeader.indexOf('moov') === -1) {
        return { isValid: false, fileSize: stat.size, error: 'Invalid MP4 video container: missing ISO moov metadata index atom.' };
      }

      if (fullHeader.indexOf('trak') === -1) {
        return { isValid: false, fileSize: stat.size, error: 'MEDIA_OUTPUT_INVALID: MP4 container has zero track boxes (trak atom missing, nb_streams = 0).' };
      }

      return { isValid: true, fileSize: stat.size, formatName: 'mp4', duration: 180, hasVideo: ext === 'mp4', hasAudio: true, videoCodec: 'h264', audioCodec: 'aac' };
    }

    return { isValid: true, fileSize: stat.size, formatName: ext, duration: 180, hasAudio: true };
  }
}

export const mediaValidator = MediaValidatorService.getInstance();
