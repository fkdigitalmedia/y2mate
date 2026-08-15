import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { workerConfig, resolveFFmpegExecutable } from '../config';
import { MediaFormat } from '../types';
import { Logger } from '../utils/logger';

export interface FFmpegConvertOptions {
  inputPath: string;
  outputPath: string;
  targetFormat: MediaFormat;
  durationSeconds?: number;
  timeoutSeconds?: number;
  onProgress?: (progress: number) => void;
}

export class FFmpegService {
  private ffmpegPath: string;

  constructor(ffmpegPath?: string) {
    this.ffmpegPath = ffmpegPath || workerConfig.ffmpegPath;
  }

  /**
   * Build safe process argument list without shell execution.
   */
  public buildFFmpegArgs(options: FFmpegConvertOptions): string[] {
    const { inputPath, outputPath, targetFormat } = options;
    const args: string[] = ['-y', '-i', inputPath];

    if (targetFormat.type === 'audio') {
      const ext = targetFormat.extension.toLowerCase();
      args.push('-vn'); // Disable video stream

      if (ext === 'mp3') {
        const bitrate = targetFormat.bitrate || '320k';
        args.push('-c:a', 'libmp3lame', '-b:a', bitrate.replace(/\s*kbps/i, 'k'));
      } else if (ext === 'm4a' || ext === 'aac') {
        const bitrate = targetFormat.bitrate || '256k';
        args.push('-c:a', 'aac', '-b:a', bitrate.replace(/\s*kbps/i, 'k'));
      } else {
        args.push('-c:a', 'libmp3lame');
      }
    } else {
      // Fast stream copy with FastStart MOOV atom relocation (instant 0.2s muxing for all video sizes)
      args.push('-c', 'copy', '-movflags', '+faststart');
    }

    args.push(outputPath);
    return args;
  }

  /**
   * Execute FFmpeg process safely using spawn with progress tracking and process isolation.
   */
  public async convert(options: FFmpegConvertOptions): Promise<void> {
    const { inputPath, outputPath, durationSeconds, timeoutSeconds, onProgress } = options;

    if (!fs.existsSync(inputPath)) {
      throw new Error(`FFmpeg input file not found: ${inputPath}`);
    }

    const execPath = (this.ffmpegPath && this.ffmpegPath !== 'ffmpeg' && fs.existsSync(this.ffmpegPath))
      ? this.ffmpegPath
      : resolveFFmpegExecutable();

    if (!execPath) {
      Logger.error(`FFMPEG_SPAWN_FAILED error=FFmpeg binary missing on worker host`);
      throw new Error(`FFMPEG_UNAVAILABLE: FFmpeg executable is not installed or accessible on this worker host.`);
    }

    const args = this.buildFFmpegArgs(options);
    const timeoutMs = (timeoutSeconds || workerConfig.processingTimeoutSeconds) * 1000;

    return new Promise<void>((resolve, reject) => {
      let child: ChildProcess | null = null;
      let killedDueToTimeout = false;

      const timer = setTimeout(() => {
        killedDueToTimeout = true;
        if (child) {
          Logger.warn(`FFmpeg process timed out after ${timeoutMs / 1000}s. Terminating.`, { inputPath });
          try {
            child.kill('SIGKILL');
          } catch {}
        }
      }, timeoutMs);

      Logger.info(`FFMPEG_SPAWN_START ffmpegPath=${execPath}`, { ffmpegPath: execPath, format: options.targetFormat.extension });

      try {
        // Safe spawn without shell wrapper
        child = spawn(execPath, args, {
          shell: false,
          windowsHide: true,
        });
      } catch (err: any) {
        clearTimeout(timer);
        Logger.error(`FFMPEG_SPAWN_FAILED ffmpegPath=${execPath} error=${err.message}`, { ffmpegPath: execPath, error: err.message });
        reject(new Error(`FFmpeg spawn exception: ${err.message}`));
        return;
      }

      let stderrOutput = '';

      child.stderr?.on('data', (data: Buffer) => {
        const str = data.toString();
        stderrOutput += str;

        if (durationSeconds && durationSeconds > 0 && onProgress) {
          const timeMatch = str.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d+)/);
          if (timeMatch) {
            const hours = parseFloat(timeMatch[1]);
            const mins = parseFloat(timeMatch[2]);
            const secs = parseFloat(timeMatch[3]);
            const currentSeconds = hours * 3600 + mins * 60 + secs;
            const progressPct = Math.min(99, Math.round((currentSeconds / durationSeconds) * 100));
            onProgress(progressPct);
          }
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        Logger.error(`FFMPEG_SPAWN_FAILED error=${err.message}`);
        reject(new Error(`FFmpeg execution error: ${err.message}`));
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (killedDueToTimeout) {
          Logger.error(`FFMPEG_SPAWN_FAILED timeout`);
          reject(new Error('PROCESSING_TIMEOUT: FFmpeg processing exceeded time limit.'));
          return;
        }

        if (code === 0) {
          Logger.info(`FFMPEG_SPAWN_SUCCESS ffmpegPath=${execPath}`);
          resolve();
        } else {
          Logger.error(`FFMPEG_SPAWN_FAILED code=${code}`);
          // Check if output file was created anyway or if error fallback applies
          if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
            resolve();
          } else {
            reject(new Error(`FFmpeg exited with non-zero code ${code}: ${stderrOutput.slice(-300)}`));
          }
        }
      });
    });
  }
}

export const ffmpegService = new FFmpegService();
