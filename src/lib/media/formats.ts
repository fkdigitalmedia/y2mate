import { MediaResult, MediaFormat } from './types';
import { MediaEngineError } from './errors';

export function verifyFormatBelongsToMedia(media: MediaResult, formatId: string): MediaFormat {
  if (!media || !media.formats || !Array.isArray(media.formats)) {
    throw new MediaEngineError('INVALID_URL', 'Invalid media result state.', 400);
  }

  const found = media.formats.find((f) => f.id === formatId);
  if (!found) {
    throw new MediaEngineError('INVALID_URL', `Requested format '${formatId}' does not belong to analyzed media '${media.id}'.`, 400);
  }

  return found;
}

export function groupFormatsByType(formats: MediaFormat[]) {
  const videoFormats = formats.filter((f) => f.type === 'video');
  const audioFormats = formats.filter((f) => f.type === 'audio');

  return {
    video: videoFormats,
    audio: audioFormats,
  };
}
