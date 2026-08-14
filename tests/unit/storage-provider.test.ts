import { describe, it, expect } from 'vitest';
import { LocalDiskStorageProvider } from '../../worker/src/storage/storage-provider';
import fs from 'fs';
import path from 'path';

describe('StorageProvider & Signed URLs', () => {
  const storage = LocalDiskStorageProvider.getInstance();
  const testFile = path.join(__dirname, 'test_sample.txt');

  it('uploads a file and generates a signed URL with expiration', async () => {
    await fs.promises.writeFile(testFile, 'VidFetch Storage Test Content');

    const key = 'downloads/job_test_123/result.mp4';
    await storage.uploadFile(key, testFile, 'video/mp4');

    const signedUrl = await storage.createSignedUrl(key, 1800);
    expect(signedUrl).toContain('/api/download/file/downloads');
    expect(signedUrl).toContain('token=signed_');

    const meta = await storage.getMetadata(key);
    expect(meta).not.toBeNull();
    expect(meta?.mimeType).toBe('video/mp4');

    await storage.deleteFile(key);
    if (fs.existsSync(testFile)) await fs.promises.unlink(testFile);
  });
});
