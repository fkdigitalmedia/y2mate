import { describe, it, expect } from 'vitest';
import { FFmpegService } from '../../worker/src/media/ffmpeg-service';

describe('FFmpegService Argument Construction', () => {
  const ffmpeg = new FFmpegService();

  it('builds safe audio extraction arguments without shell injection', () => {
    const args = ffmpeg.buildFFmpegArgs({
      inputPath: '/tmp/y2matevideo/job1/input.mp4',
      outputPath: '/tmp/y2matevideo/job1/output.mp3',
      targetFormat: {
        id: 'a320k',
        type: 'audio',
        extension: 'mp3',
        quality: '320 kbps',
        bitrate: '320 kbps',
        mimeType: 'audio/mpeg',
        downloadable: true,
        requiresProcessing: true,
      },
    });

    expect(args).toEqual([
      '-y',
      '-i',
      '/tmp/y2matevideo/job1/input.mp4',
      '-vn',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '320k',
      '/tmp/y2matevideo/job1/output.mp3',
    ]);
  });

  it('builds safe video container copy arguments', () => {
    const args = ffmpeg.buildFFmpegArgs({
      inputPath: '/tmp/y2matevideo/job1/input.mp4',
      outputPath: '/tmp/y2matevideo/job1/output.mp4',
      targetFormat: {
        id: 'v1080p',
        type: 'video',
        extension: 'mp4',
        quality: '1080p',
        mimeType: 'video/mp4',
        downloadable: true,
        requiresProcessing: false,
      },
    });

    expect(args).toEqual([
      '-y',
      '-i',
      '/tmp/y2matevideo/job1/input.mp4',
      '-c',
      'copy',
      '/tmp/y2matevideo/job1/output.mp4',
    ]);
  });
});
