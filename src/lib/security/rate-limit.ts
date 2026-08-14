interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  limit?: number; // max requests per window
  windowMs?: number; // window size in milliseconds
}

export function checkRateLimit(ip: string, options: RateLimitOptions = {}): { allowed: boolean; remaining: number; resetTime: number } {
  const limit = options.limit || 30; // 30 requests per window by default
  const windowMs = options.windowMs || 60 * 1000; // 1 minute window by default

  const now = Date.now();
  const clientKey = ip || 'anonymous';
  const record = memoryStore.get(clientKey);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(clientKey, newRecord);
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: newRecord.resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetTime: record.resetAt,
  };
}
