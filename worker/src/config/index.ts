import path from 'path';
import os from 'os';

export interface WorkerConfig {
  workerId: string;
  workerSecret: string;
  concurrency: number;
  maxInputFileSizeMb: number;
  maxOutputFileSizeMb: number;
  processingTimeoutSeconds: number;
  jobTtlMinutes: number;
  maxJobRetries: number;
  tempBaseDir: string;
  ffmpegPath: string;
  storageProvider: 'memory' | 'local' | 'r2' | 's3';
  storageEndpoint?: string;
  storageBucket: string;
  storageAccessKey?: string;
  storageSecretKey?: string;
  storageRegion: string;
  databaseUrl?: string;
}

function resolveFFmpegExecutable(): string {
  if (process.env.FFMPEG_PATH) {
    return process.env.FFMPEG_PATH;
  }
  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && typeof ffmpegStatic === 'string') {
      return ffmpegStatic;
    }
  } catch {}
  return 'ffmpeg';
}

export function loadWorkerConfig(): WorkerConfig {
  const workerId = process.env.WORKER_ID || `worker_${os.hostname()}_${process.pid}_${Math.random().toString(36).substring(2, 7)}`;
  
  return {
    workerId,
    workerSecret: process.env.WORKER_SECRET || 'dev-worker-secret-change-in-prod',
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),
    maxInputFileSizeMb: parseInt(process.env.MAX_INPUT_FILE_SIZE_MB || '500', 10),
    maxOutputFileSizeMb: parseInt(process.env.MAX_OUTPUT_FILE_SIZE_MB || '500', 10),
    processingTimeoutSeconds: parseInt(process.env.PROCESSING_TIMEOUT_SECONDS || '300', 10),
    jobTtlMinutes: parseInt(process.env.JOB_TTL_MINUTES || '60', 10),
    maxJobRetries: parseInt(process.env.MAX_JOB_RETRIES || '2', 10),
    tempBaseDir: process.env.TEMP_DIR || path.join(os.tmpdir(), 'y2matevideo'),
    ffmpegPath: resolveFFmpegExecutable(),
    storageProvider: (process.env.STORAGE_PROVIDER as any) || 'memory',
    storageEndpoint: process.env.STORAGE_ENDPOINT,
    storageBucket: process.env.STORAGE_BUCKET || 'y2matevideo-temp-media',
    storageAccessKey: process.env.STORAGE_ACCESS_KEY || process.env.STORAGE_ACCESS_KEY_ID,
    storageSecretKey: process.env.STORAGE_SECRET_KEY || process.env.STORAGE_SECRET_ACCESS_KEY,
    storageRegion: process.env.STORAGE_REGION || 'auto',
    databaseUrl: process.env.DATABASE_URL,
  };
}

export const workerConfig = loadWorkerConfig();
