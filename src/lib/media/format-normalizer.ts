import { MediaFormat } from './types';

export class FormatNormalizer {
  /**
   * Sorts video formats (highest resolution/quality first) and audio formats (highest bitrate first).
   */
  public static sortFormats(formats: MediaFormat[]): MediaFormat[] {
    const video = formats.filter((f) => f.type === 'video');
    const audio = formats.filter((f) => f.type === 'audio');

    video.sort((a, b) => {
      const resA = parseInt(a.quality, 10) || (a.resolution?.includes('1080') ? 1080 : 720);
      const resB = parseInt(b.quality, 10) || (b.resolution?.includes('1080') ? 1080 : 720);
      return resB - resA;
    });

    audio.sort((a, b) => {
      const bitA = parseInt(a.bitrate || a.quality, 10) || 128;
      const bitB = parseInt(b.bitrate || a.quality, 10) || 128;
      return bitB - bitA;
    });

    return [...video, ...audio];
  }

  /**
   * Filters out duplicate format entries and unsafe extensions.
   */
  public static filterFormats(formats: MediaFormat[]): MediaFormat[] {
    const seen = new Set<string>();
    const allowedExtensions = ['mp4', 'webm', 'm4a', 'mp3', 'aac', 'ogg', 'wav'];

    return formats.filter((format) => {
      if (!format || !format.id || !format.extension) return false;

      const ext = format.extension.toLowerCase();
      if (!allowedExtensions.includes(ext)) return false;

      const key = `${format.type}_${format.quality}_${ext}`;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }
}
