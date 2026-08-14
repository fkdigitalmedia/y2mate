/**
 * Privacy-conscious Google Analytics 4 (GA4) event tracking wrapper.
 * Never tracks personal data, passwords, secrets, or raw media stream payloads.
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'url_submit'
  | 'analysis_started'
  | 'analysis_success'
  | 'analysis_failed'
  | 'format_selected'
  | 'download_job_created'
  | 'download_completed'
  | 'download_failed';

export function trackEvent(eventName: AnalyticsEvent, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Verify consent before emitting telemetry
  const consent = localStorage.getItem('vidfetch_analytics_consent');
  if (consent !== 'granted') return;

  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', eventName, {
      send_to: process.env.NEXT_PUBLIC_GA_ID,
      ...params,
    });
  }
}
