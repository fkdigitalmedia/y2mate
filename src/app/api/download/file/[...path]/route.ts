import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const rawPath = params.path ? params.path.join('/') : '';
    const decodedKey = decodeURIComponent(rawPath);
    
    // Sanitize object key to prevent path traversal
    const cleanKey = decodedKey.replace(/\.\./g, '').replace(/^[/\\]+/, '');
    
    if (!cleanKey) {
      return new NextResponse('File path not specified.', { status: 400 });
    }

    // Determine MIME type & filename extension
    const ext = path.extname(cleanKey).toLowerCase().replace('.', '') || 'mp4';
    let mimeType = 'video/mp4';
    let defaultFileName = `y2matevideo_download.${ext}`;

    if (ext === 'mp3') {
      mimeType = 'audio/mpeg';
      defaultFileName = `y2matevideo_audio.mp3`;
    } else if (ext === 'm4a' || ext === 'aac') {
      mimeType = 'audio/mp4';
      defaultFileName = `y2matevideo_audio.m4a`;
    } else if (ext === 'webm') {
      mimeType = 'video/webm';
      defaultFileName = `y2matevideo_download.webm`;
    }

    // Search local storage vault locations for stored file
    const tempBase = process.env.TEMP_DIR || path.join(os.tmpdir(), 'y2matevideo');
    const storageVaultDir = path.join(tempBase, 'storage_vault');
    const sanitizedFileName = cleanKey.replace(/[/\\]/g, '_');
    const localFilePath = path.join(storageVaultDir, sanitizedFileName);

    let fileBuffer: Buffer;

    if (fs.existsSync(localFilePath)) {
      fileBuffer = await fs.promises.readFile(localFilePath);
    } else {
      // Fallback sample media payload for demo streams
      const sampleText = `y2matevideo.com Media File\nFormat: ${ext.toUpperCase()}\nGenerated: ${new Date().toISOString()}\nKey: ${cleanKey}`;
      fileBuffer = Buffer.from(sampleText, 'utf-8');
    }

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Disposition', `attachment; filename="${defaultFileName}"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new NextResponse('Internal server error serving media file.', { status: 500 });
  }
}
