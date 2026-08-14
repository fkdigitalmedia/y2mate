import { CircuitState, ProviderHealthMetrics } from './types';

export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private metricsMap = new Map<string, ProviderHealthMetrics>();
  private openStateTimers = new Map<string, number>();
  private readonly failureThreshold = 3;
  private readonly cooldownMs = 60 * 1000; // 60 seconds cooldown

  public static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  public getMetrics(providerId: string): ProviderHealthMetrics {
    if (!this.metricsMap.has(providerId)) {
      this.metricsMap.set(providerId, {
        providerId,
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        successCount: 0,
        failureCount: 0,
        consecutiveFailures: 0,
        avgResponseMs: 120,
      });
    }

    const metrics = this.metricsMap.get(providerId)!;

    // Check if OPEN state cooldown has expired
    if (metrics.circuitState === 'OPEN') {
      const openTime = this.openStateTimers.get(providerId) || 0;
      if (Date.now() - openTime > this.cooldownMs) {
        metrics.circuitState = 'HALF_OPEN';
        metrics.status = 'DEGRADED';
      }
    }

    return metrics;
  }

  public canExecute(providerId: string): boolean {
    const metrics = this.getMetrics(providerId);
    return metrics.circuitState !== 'OPEN';
  }

  public recordSuccess(providerId: string, durationMs = 150): void {
    const metrics = this.getMetrics(providerId);
    metrics.successCount += 1;
    metrics.consecutiveFailures = 0;
    metrics.circuitState = 'CLOSED';
    metrics.status = 'HEALTHY';
    metrics.lastSuccess = new Date().toISOString();
    metrics.avgResponseMs = Math.round((metrics.avgResponseMs + durationMs) / 2);
  }

  public recordFailure(providerId: string): void {
    const metrics = this.getMetrics(providerId);
    metrics.failureCount += 1;
    metrics.consecutiveFailures += 1;
    metrics.lastFailure = new Date().toISOString();

    if (metrics.consecutiveFailures >= this.failureThreshold) {
      metrics.circuitState = 'OPEN';
      metrics.status = 'UNAVAILABLE';
      this.openStateTimers.set(providerId, Date.now());
      console.warn(`[CIRCUIT_BREAKER] Circuit OPENED for provider ${providerId} (3 consecutive failures)`);
    } else {
      metrics.status = 'DEGRADED';
    }
  }

  public getAllMetrics(): ProviderHealthMetrics[] {
    return Array.from(this.metricsMap.values());
  }
}

export const circuitBreaker = CircuitBreakerManager.getInstance();
