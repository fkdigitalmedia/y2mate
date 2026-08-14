export class Logger {
  private static formatPrefix(jobId?: string, stage?: string): string {
    const timestamp = new Date().toISOString();
    const jobTag = jobId ? `[JOB:${jobId}]` : '[WORKER]';
    const stageTag = stage ? `[STAGE:${stage}]` : '';
    return `${timestamp} ${jobTag}${stageTag}`;
  }

  public static info(message: string, meta?: { jobId?: string; stage?: string; [key: string]: any }) {
    const prefix = this.formatPrefix(meta?.jobId, meta?.stage);
    const extra = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`${prefix} INFO: ${message}${extra}`);
  }

  public static warn(message: string, meta?: { jobId?: string; stage?: string; [key: string]: any }) {
    const prefix = this.formatPrefix(meta?.jobId, meta?.stage);
    const extra = meta ? ` ${JSON.stringify(meta)}` : '';
    console.warn(`${prefix} WARN: ${message}${extra}`);
  }

  public static error(message: string, meta?: { jobId?: string; stage?: string; [key: string]: any }) {
    const prefix = this.formatPrefix(meta?.jobId, meta?.stage);
    const extra = meta ? ` ${JSON.stringify(meta)}` : '';
    console.error(`${prefix} ERROR: ${message}${extra}`);
  }

  public static jobProgress(jobId: string, stage: string, progress: number, details?: string) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [JOB] ${jobId} [STAGE] ${stage} [PROGRESS] ${progress}%${details ? ` - ${details}` : ''}`);
  }
}
