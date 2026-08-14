export type ErrorCode =
  | 'INVALID_SOURCE'
  | 'SOURCE_UNAVAILABLE'
  | 'CONTENT_NOT_SUPPORTED'
  | 'PRIVATE_CONTENT'
  | 'FILE_TOO_LARGE'
  | 'PROCESSING_TIMEOUT'
  | 'FFMPEG_ERROR'
  | 'STORAGE_ERROR'
  | 'NETWORK_ERROR'
  | 'JOB_EXPIRED'
  | 'INTERNAL_ERROR'
  | 'INVALID_URL'
  | 'UNSUPPORTED_PLATFORM'
  | 'PLATFORM_DISABLED'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'TEMPORARY_ERROR';

export class MediaEngineError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode = 400) {
    super(message);
    this.name = 'MediaEngineError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, MediaEngineError.prototype);
  }
}

export function toSafeUserError(err: unknown): { code: ErrorCode; message: string; statusCode: number } {
  if (err instanceof MediaEngineError) {
    return {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    };
  }

  const rawMessage = err instanceof Error ? err.message : String(err);

  if (rawMessage.includes('FILE_TOO_LARGE') || rawMessage.includes('exceeds limit')) {
    return {
      code: 'FILE_TOO_LARGE',
      message: 'The requested media exceeds the maximum supported file size limit.',
      statusCode: 413,
    };
  }

  if (rawMessage.includes('PROCESSING_TIMEOUT') || rawMessage.includes('timed out')) {
    return {
      code: 'PROCESSING_TIMEOUT',
      message: 'Media processing timed out. Please try a lower resolution or shorter video.',
      statusCode: 504,
    };
  }

  if (rawMessage.includes('ECONNREFUSED') || rawMessage.includes('ETIMEDOUT') || rawMessage.includes('NETWORK_ERROR')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'The source platform is temporarily unreachable. Please try again shortly.',
      statusCode: 503,
    };
  }

  if (rawMessage.toLowerCase().includes('private') || rawMessage.toLowerCase().includes('restricted')) {
    return {
      code: 'PRIVATE_CONTENT',
      message: 'Private or age-restricted content cannot be processed.',
      statusCode: 403,
    };
  }

  if (rawMessage.toLowerCase().includes('drm') || rawMessage.toLowerCase().includes('copyright') || rawMessage.toLowerCase().includes('paywall')) {
    return {
      code: 'CONTENT_NOT_SUPPORTED',
      message: 'This content format or protected stream cannot be processed.',
      statusCode: 400,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected processing error occurred. Please verify the URL and try again.',
    statusCode: 500,
  };
}
