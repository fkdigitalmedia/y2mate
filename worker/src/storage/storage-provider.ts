import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3PresignedUrl } from '@aws-sdk/s3-request-presigner';
import { workerConfig } from '../config';
import { StorageMetadata } from '../types';
import { Logger } from '../utils/logger';

export interface StorageProvider {
  uploadFile(key: string, sourcePath: string, mimeType: string): Promise<string>;
  createSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<StorageMetadata | null>;
  getFileBuffer?(key: string): Promise<Buffer | null>;
}

// Global in-memory storage buffer map for shared process persistence
declare global {
  var __sharedStorageVaultMap: Map<string, { buffer: Buffer; mimeType: string; createdAt: Date }> | undefined;
}

if (!globalThis.__sharedStorageVaultMap) {
  globalThis.__sharedStorageVaultMap = new Map();
}

/**
 * Cloudflare R2 / AWS S3 Compatible Object Storage Provider
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = workerConfig.storageBucket;
    this.client = new S3Client({
      region: workerConfig.storageRegion,
      endpoint: workerConfig.storageEndpoint,
      credentials: {
        accessKeyId: workerConfig.storageAccessKey || '',
        secretAccessKey: workerConfig.storageSecretKey || '',
      },
    });
  }

  async uploadFile(key: string, sourcePath: string, mimeType: string): Promise<string> {
    try {
      const fileStream = fs.createReadStream(sourcePath);
      const stat = await fs.promises.stat(sourcePath);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileStream,
        ContentType: mimeType,
        ContentLength: stat.size,
      });

      await this.client.send(command);
      Logger.info(`Uploaded object key ${key} (${stat.size} bytes) to R2/S3`, { key });
      return key;
    } catch (err: any) {
      Logger.warn(`S3/R2 upload notice (${err.message}). Falling back to local disk storage vault.`, { key });
      return await LocalDiskStorageProvider.getInstance().uploadFile(key, sourcePath, mimeType);
    }
  }

  async createSignedUrl(key: string, expiresInSeconds = 1800): Promise<string> {
    try {
      const localMeta = await LocalDiskStorageProvider.getInstance().getMetadata(key);
      if (localMeta) {
        return await LocalDiskStorageProvider.getInstance().createSignedUrl(key, expiresInSeconds);
      }

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getS3PresignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    } catch (err: any) {
      Logger.warn(`S3/R2 presigned URL notice (${err.message}). Using local disk fallback.`, { key });
      return await LocalDiskStorageProvider.getInstance().createSignedUrl(key, expiresInSeconds);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      return false;
    }
  }

  async getMetadata(key: string): Promise<StorageMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const res = await this.client.send(command);
      return {
        key,
        size: res.ContentLength || 0,
        mimeType: res.ContentType || 'application/octet-stream',
        createdAt: res.LastModified || new Date(),
      };
    } catch {
      return null;
    }
  }
}

/**
 * Local Disk & In-Memory Fallback Storage Provider for Local Dev / Testing
 */
export class LocalDiskStorageProvider implements StorageProvider {
  private static instance: LocalDiskStorageProvider;
  private storageDir: string;

  private constructor() {
    this.storageDir = path.join(workerConfig.tempBaseDir, 'storage_vault');
    if (!fs.existsSync(this.storageDir)) {
      try {
        fs.mkdirSync(this.storageDir, { recursive: true });
      } catch {}
    }
  }

  public static getInstance(): LocalDiskStorageProvider {
    if (!LocalDiskStorageProvider.instance) {
      LocalDiskStorageProvider.instance = new LocalDiskStorageProvider();
    }
    return LocalDiskStorageProvider.instance;
  }

  async uploadFile(key: string, sourcePath: string, mimeType: string): Promise<string> {
    const fileBuf = await fs.promises.readFile(sourcePath);
    const sanitizedKey = key.replace(/[/\\]/g, '_');
    const targetPath = path.join(this.storageDir, sanitizedKey);

    try {
      await fs.promises.writeFile(targetPath, fileBuf);
    } catch {}

    globalThis.__sharedStorageVaultMap!.set(key, {
      buffer: fileBuf,
      mimeType,
      createdAt: new Date(),
    });
    globalThis.__sharedStorageVaultMap!.set(sanitizedKey, {
      buffer: fileBuf,
      mimeType,
      createdAt: new Date(),
    });

    Logger.info(`Stored local object key ${key} (${fileBuf.length} bytes)`, { key });
    return key;
  }

  async createSignedUrl(key: string, expiresInSeconds = 1800): Promise<string> {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const token = `signed_${Math.random().toString(36).substring(2, 10)}`;
    return `/api/download/file/${encodeURIComponent(key)}?token=${token}&expires=${expiresAt}`;
  }

  async deleteFile(key: string): Promise<boolean> {
    const sanitizedKey = key.replace(/[/\\]/g, '_');
    const targetPath = path.join(this.storageDir, sanitizedKey);
    globalThis.__sharedStorageVaultMap!.delete(key);
    globalThis.__sharedStorageVaultMap!.delete(sanitizedKey);
    try {
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
      }
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(key: string): Promise<StorageMetadata | null> {
    const sanitizedKey = key.replace(/[/\\]/g, '_');
    const entry = globalThis.__sharedStorageVaultMap!.get(key) || globalThis.__sharedStorageVaultMap!.get(sanitizedKey);
    if (entry) {
      return {
        key,
        size: entry.buffer.length,
        mimeType: entry.mimeType,
        createdAt: entry.createdAt,
      };
    }

    const targetPath = path.join(this.storageDir, sanitizedKey);
    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      return {
        key,
        size: stat.size,
        mimeType: 'video/mp4',
        createdAt: stat.mtime,
      };
    }

    return null;
  }

  async getFileBuffer(key: string): Promise<Buffer | null> {
    const sanitizedKey = key.replace(/[/\\]/g, '_');
    const entry = globalThis.__sharedStorageVaultMap!.get(key) || globalThis.__sharedStorageVaultMap!.get(sanitizedKey);
    if (entry) {
      return entry.buffer;
    }

    const targetPath = path.join(this.storageDir, sanitizedKey);
    if (fs.existsSync(targetPath)) {
      return await fs.promises.readFile(targetPath);
    }

    return null;
  }
}

// Select storage provider dynamically based on current environment configuration
export function getStorageProvider(): StorageProvider {
  if (
    workerConfig.storageAccessKey &&
    workerConfig.storageSecretKey &&
    !workerConfig.storageAccessKey.includes('your-') &&
    workerConfig.storageAccessKey.length > 5
  ) {
    return new S3StorageProvider();
  }
  return LocalDiskStorageProvider.getInstance();
}

export const storageProvider: StorageProvider = {
  uploadFile: (key: string, sourcePath: string, mimeType: string) =>
    getStorageProvider().uploadFile(key, sourcePath, mimeType),
  createSignedUrl: (key: string, expiresInSeconds?: number) =>
    getStorageProvider().createSignedUrl(key, expiresInSeconds),
  deleteFile: (key: string) =>
    getStorageProvider().deleteFile(key),
  getMetadata: (key: string) =>
    getStorageProvider().getMetadata(key),
  getFileBuffer: (key: string) =>
    (getStorageProvider() as any).getFileBuffer ? (getStorageProvider() as any).getFileBuffer(key) : Promise.resolve(null),
};
