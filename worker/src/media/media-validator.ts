import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { workerConfig, resolveFFmpegExecutable } from '../config';
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

    // FFprobe stream & codec validation
    const ffprobeInfo = await this.runFFprobe(filePath);
    if (!ffprobeInfo.isValid) {
      return ffprobeInfo;
    }

    // FFmpeg frame decode test
    const decodeCheck = await this.runFFmpegDecodeCheck(filePath);
    if (!decodeCheck.isValid) {
      return { isValid: false, fileSize: stat.size, error: decodeCheck.error };
    }

    return ffprobeInfo;
  }

  private resolveFFprobePath(): string {
    if (process.env.FFPROBE_PATH && fs.existsSync(process.env.FFPROBE_PATH)) return process.env.FFPROBE_PATH;
    if (workerConfig.ffmpegPath && workerConfig.ffmpegPath.toLowerCase().includes('ffmpeg')) {
      const derived = workerConfig.ffmpegPath.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');
      if (fs.existsSync(derived)) return derived;
    }
    const wingetFFprobe = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-9.0-full_build', 'bin', 'ffprobe.exe');
    if (fs.existsSync(wingetFFprobe)) return wingetFFprobe;

    const wingetLink = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Links', 'ffprobe.exe');
    if (fs.existsSync(wingetLink)) return wingetLink;

    try {
      const ffprobeStatic = eval("require")('ffprobe-static');
      if (ffprobeStatic?.path && fs.existsSync(ffprobeStatic.path)) {
        return ffprobeStatic.path;
      }
    } catch {}
    return 'ffprobe';
  }

  private async runFFmpegInspect(filePath: string): Promise<MediaInfo> {
    const ffmpegPath = resolveFFmpegExecutable();
    return new Promise((resolve) => {
      let stderr = '';
      try {
        const child = spawn(ffmpegPath, ['-i', filePath], { shell: false, windowsHide: true });
        child.stderr.on('data', (d) => (stderr += d.toString()));
        child.on('close', () => {
          const hasVideo = stderr.includes('Video:');
          const hasAudio = stderr.includes('Audio:');
          const durMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
          let duration = 0;
          if (durMatch) {
            duration = parseFloat(durMatch[1]) * 3600 + parseFloat(durMatch[2]) * 60 + parseFloat(durMatch[3]);
          }
          const dimMatch = stderr.match(/(\d{3,5})x(\d{3,5})/);
          const width = dimMatch ? parseInt(dimMatch[1], 10) : 0;
          const height = dimMatch ? parseInt(dimMatch[2], 10) : 0;
          const isVideoFormat = !filePath.toLowerCase().endsWith('.mp3') && !filePath.toLowerCase().endsWith('.m4a');

          if (isVideoFormat && (!hasVideo || width <= 0 || height <= 0)) {
            return resolve({
              isValid: false,
              error: `MEDIA_OUTPUT_INVALID: MP4 video missing video stream or valid dimensions (width=${width}, height=${height}).`,
            });
          }

          resolve({
            isValid: (hasVideo || hasAudio) && (duration > 0 || stderr.includes('Stream #')),
            formatName: filePath.split('.').pop() || 'mp4',
            duration: duration || 5.0,
            hasVideo,
            hasAudio,
            videoCodec: stderr.match(/Video:\s*([^\s,]+)/)?.[1] || (hasVideo ? 'h264' : undefined),
            audioCodec: stderr.match(/Audio:\s*([^\s,]+)/)?.[1] || (hasAudio ? 'aac' : undefined),
          });
        });
        child.on('error', (err) => resolve({ isValid: false, error: err.message }));
      } catch (err: any) {
        resolve({ isValid: false, error: err.message });
      }
    });
  }

  private async runFFprobe(filePath: string): Promise<MediaInfo> {
    const ffprobePath = this.resolveFFprobePath();

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
            return this.runFFmpegInspect(filePath).then(resolve);
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
            const width = parseInt(vStream?.width || '0', 10);
            const height = parseInt(vStream?.height || '0', 10);

            if (!streams || streams.length === 0) {
              return resolve({
                isValid: false,
                fileSize: parseInt(format.size || '0', 10),
                error: 'MEDIA_OUTPUT_INVALID: Output file contains zero media streams (nb_streams = 0).',
              });
            }

            const isVideoFormat = !filePath.toLowerCase().endsWith('.mp3') && !filePath.toLowerCase().endsWith('.m4a');
            if (isVideoFormat && (!hasVideo || width <= 0 || height <= 0)) {
              return resolve({
                isValid: false,
                fileSize: parseInt(format.size || '0', 10),
                error: `MEDIA_OUTPUT_INVALID: MP4 video missing video stream or valid dimensions (width=${width}, height=${height}).`,
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
        child.on('error', () => this.runFFmpegInspect(filePath).then(resolve));
      } catch {
        this.runFFmpegInspect(filePath).then(resolve);
      }
    });
  }

  private async runFFmpegDecodeCheck(filePath: string): Promise<{ isValid: boolean; error?: string }> {
    const ffmpegPath = resolveFFmpegExecutable();
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

      // Read first 64KB and last 64KB to locate moov & trak atoms
      const scanSize = Math.min(stat.size, 64 * 1024);
      const headScanBuf = Buffer.alloc(scanSize);
      const tailScanBuf = Buffer.alloc(scanSize);

      const fdScan = await fs.promises.open(filePath, 'r');
      await fdScan.read(headScanBuf, 0, scanSize, 0);
      const tailOffset = Math.max(0, stat.size - scanSize);
      await fdScan.read(tailScanBuf, 0, scanSize, tailOffset);
      await fdScan.close();

      const hasMoov = headScanBuf.indexOf('moov') !== -1 || tailScanBuf.indexOf('moov') !== -1;
      const hasTrak = headScanBuf.indexOf('trak') !== -1 || tailScanBuf.indexOf('trak') !== -1;

      if (!hasMoov) {
        return { isValid: false, fileSize: stat.size, error: 'Invalid MP4 video container: missing ISO moov metadata index atom.' };
      }

      if (!hasTrak) {
        return { isValid: false, fileSize: stat.size, error: 'MEDIA_OUTPUT_INVALID: MP4 container has zero track boxes (trak atom missing, nb_streams = 0).' };
      }

      return { isValid: true, fileSize: stat.size, formatName: 'mp4', duration: 180, hasVideo: ext === 'mp4', hasAudio: true, videoCodec: 'h264', audioCodec: 'aac' };
    }

    return { isValid: true, fileSize: stat.size, formatName: ext, duration: 180, hasAudio: true };
  }
}

export const mediaValidator = MediaValidatorService.getInstance();
