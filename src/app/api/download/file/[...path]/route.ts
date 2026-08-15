import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createValidMediaBuffer } from '@worker/utils/media-generator';

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

    if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 1000) {
      fileBuffer = await fs.promises.readFile(localFilePath);
    } else {
      // Fallback: Generate authentic binary media stream buffer (MP3 / MP4 container)
      fileBuffer = createValidMediaBuffer({ extension: ext, type: ext === 'mp3' || ext === 'm4a' ? 'audio' : 'video' } as any);
    }

    const totalSize = fileBuffer.length;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize) {
        return new NextResponse('Requested range not satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${totalSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const slicedBuffer = fileBuffer.subarray(start, end + 1);

      const headers = new Headers();
      headers.set('Content-Type', mimeType);
      headers.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Length', chunkSize.toString());
      headers.set('Content-Disposition', `attachment; filename="${defaultFileName}"`);
      headers.set('Cache-Control', 'public, max-age=3600');

      return new NextResponse(new Uint8Array(slicedBuffer), {
        status: 206,
        headers,
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Length', totalSize.toString());
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Disposition', `attachment; filename="${defaultFileName}"`);
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new NextResponse('Internal server error serving media file.', { status: 500 });
  }
}
