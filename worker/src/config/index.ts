import path from 'path';
import os from 'os';
import fs from 'fs';

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

export function resolveFFmpegExecutable(): string {
  const cwd = process.cwd();
  const home = os.homedir();

  const candidates: (string | undefined)[] = [
    process.env.FFMPEG_PATH,
    path.join(cwd, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    path.join(cwd, 'node_modules', 'ffmpeg-static', 'ffmpeg'),
    path.join(cwd, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    path.join(cwd, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg'),
    path.join(cwd, '.next', 'server', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    path.join(cwd, '.next', 'server', 'node_modules', 'ffmpeg-static', 'ffmpeg'),
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/snap/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
    path.join(home, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-9.0-full_build', 'bin', 'ffmpeg.exe'),
    path.join(home, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
    'C:\\Users\\Fkdigitalmedia\\AppData\\Local\\CapCut\\Apps\\7.8.8.3267\\ffmpeg.exe',
    'C:\\Users\\Fkdigitalmedia\\AppData\\Local\\CapCut\\Apps\\7.7.0.3143\\ffmpeg.exe',
    'C:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe',
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
  ];

  try {
    const ffmpegStatic = eval("require")('ffmpeg-static');
    if (ffmpegStatic && typeof ffmpegStatic === 'string') {
      candidates.unshift(ffmpegStatic);
    }
  } catch {}

  // Check system PATH via where.exe (Windows) or which (Linux/macOS)
  try {
    const cmd = process.platform === 'win32' ? 'where.exe' : 'which';
    const whichRes = spawnSync(cmd, ['ffmpeg'], { windowsHide: true });
    if (whichRes.status === 0 && whichRes.stdout) {
      const foundPath = whichRes.stdout.toString().split(/\r?\n/)[0]?.trim();
      if (foundPath && fs.existsSync(foundPath)) {
        candidates.unshift(foundPath);
      }
    }
  } catch {}

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'string' && candidate.trim().length > 0 && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Verify if raw 'ffmpeg' command executes in system PATH
  try {
    const testRes = spawnSync('ffmpeg', ['-version'], { windowsHide: true });
    if (testRes.status === 0) {
      return 'ffmpeg';
    }
  } catch {}

  return '';
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
