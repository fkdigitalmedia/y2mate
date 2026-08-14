import { JobState } from '../types';

export class JobStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<JobState, JobState[]> = {
    QUEUED: ['PROCESSING', 'CANCELLED', 'EXPIRED'],
    PROCESSING: ['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'],
    COMPLETED: ['EXPIRED'],
    FAILED: ['QUEUED', 'EXPIRED'], // Allows explicit job re-queue for retry
    EXPIRED: [],
    CANCELLED: [],
  };

  public static canTransition(current: JobState, next: JobState): boolean {
    if (current === next) return true;
    const allowed = this.ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  public static assertValidTransition(current: JobState, next: JobState): void {
    if (!this.canTransition(current, next)) {
      throw new Error(`Invalid job state transition: cannot transition from '${current}' to '${next}'.`);
    }
  }
}
