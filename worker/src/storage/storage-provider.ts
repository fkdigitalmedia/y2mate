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
  }

  async createSignedUrl(key: string, expiresInSeconds = 1800): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getS3PresignedUrl(this.client, command, { expiresIn: expiresInSeconds });
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
  private metadataMap = new Map<string, StorageMetadata>();

  private constructor() {
    this.storageDir = path.join(workerConfig.tempBaseDir, 'storage_vault');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  public static getInstance(): LocalDiskStorageProvider {
    if (!LocalDiskStorageProvider.instance) {
      LocalDiskStorageProvider.instance = new LocalDiskStorageProvider();
    }
    return LocalDiskStorageProvider.instance;
  }

  async uploadFile(key: string, sourcePath: string, mimeType: string): Promise<string> {
    const targetPath = path.join(this.storageDir, key.replace(/[/\\]/g, '_'));
    await fs.promises.copyFile(sourcePath, targetPath);
    const stat = await fs.promises.stat(targetPath);

    this.metadataMap.set(key, {
      key,
      size: stat.size,
      mimeType,
      createdAt: new Date(),
    });

    Logger.info(`Stored local object key ${key} (${stat.size} bytes)`, { key });
    return key;
  }

  async createSignedUrl(key: string, expiresInSeconds = 1800): Promise<string> {
    const meta = this.metadataMap.get(key);
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const token = `signed_${Math.random().toString(36).substring(2, 10)}`;

    if (!meta) {
      return `/api/download/file/${encodeURIComponent(key)}?error=NOT_FOUND`;
    }

    return `/api/download/file/${encodeURIComponent(key)}?token=${token}&expires=${expiresAt}`;
  }

  async deleteFile(key: string): Promise<boolean> {
    const targetPath = path.join(this.storageDir, key.replace(/[/\\]/g, '_'));
    this.metadataMap.delete(key);
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
    return this.metadataMap.get(key) || null;
  }
}

// Select storage provider based on environment configuration
export function getStorageProvider(): StorageProvider {
  if (
    (workerConfig.storageProvider === 'r2' || workerConfig.storageProvider === 's3') &&
    workerConfig.storageAccessKey &&
    workerConfig.storageSecretKey
  ) {
    return new S3StorageProvider();
  }
  return LocalDiskStorageProvider.getInstance();
}

export const storageProvider = getStorageProvider();
