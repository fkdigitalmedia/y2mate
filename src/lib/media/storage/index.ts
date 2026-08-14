export interface StorageProvider {
  uploadFile(key: string, content: Buffer | string, mimeType: string): Promise<string>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(key: string): Promise<boolean>;
  fileExists(key: string): Promise<boolean>;
}

export class TemporaryStorageService implements StorageProvider {
  private static instance: TemporaryStorageService;
  private storageMap = new Map<string, { content: Buffer | string; mimeType: string; expiresAt: number }>();

  public static getInstance(): TemporaryStorageService {
    if (!TemporaryStorageService.instance) {
      TemporaryStorageService.instance = new TemporaryStorageService();
    }
    return TemporaryStorageService.instance;
  }

  async uploadFile(key: string, content: Buffer | string, mimeType: string): Promise<string> {
    const ttlMs = 60 * 60 * 1000; // 60 minutes TTL
    const expiresAt = Date.now() + ttlMs;

    this.storageMap.set(key, { content, mimeType, expiresAt });
    return key;
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const record = this.storageMap.get(key);
    if (!record || Date.now() > record.expiresAt) {
      return `#download-expired-${key}`;
    }
    // Return temporary signed demo download token URL
    return `/api/download/file/${key}?token=signed_${Math.random().toString(36).substring(2, 9)}&expires=${Date.now() + expiresInSeconds * 1000}`;
  }

  async deleteFile(key: string): Promise<boolean> {
    return this.storageMap.delete(key);
  }

  async fileExists(key: string): Promise<boolean> {
    const record = this.storageMap.get(key);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.storageMap.delete(key);
      return false;
    }
    return true;
  }
}

export const storageProvider = TemporaryStorageService.getInstance();
