import { describe, it, expect } from 'vitest';
import { JobStateMachine } from '../../worker/src/queue/state-machine';

describe('JobStateMachine', () => {
  it('allows valid state transitions QUEUED -> PROCESSING -> COMPLETED', () => {
    expect(JobStateMachine.canTransition('QUEUED', 'PROCESSING')).toBe(true);
    expect(JobStateMachine.canTransition('PROCESSING', 'COMPLETED')).toBe(true);
  });

  it('allows failure transition PROCESSING -> FAILED', () => {
    expect(JobStateMachine.canTransition('PROCESSING', 'FAILED')).toBe(true);
  });

  it('prevents illegal transitions COMPLETED -> PROCESSING', () => {
    expect(JobStateMachine.canTransition('COMPLETED', 'PROCESSING')).toBe(false);
    expect(() => JobStateMachine.assertValidTransition('COMPLETED', 'PROCESSING')).toThrow();
  });

  it('prevents illegal transitions EXPIRED -> PROCESSING', () => {
    expect(JobStateMachine.canTransition('EXPIRED', 'PROCESSING')).toBe(false);
  });
});
