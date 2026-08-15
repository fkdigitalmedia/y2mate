import React from 'react';

export const metadata = {
  title: 'Privacy Policy | y2matevideo.com',
  description: 'Privacy Policy describing how y2matevideo.com handles user data, cookies, logs, and security.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: August 2026
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Data Collection & Privacy First</h2>
          <p>
            y2matevideo.com is designed to prioritize user privacy. We do not require user accounts, registration, or personal information (such as name, email address, or phone number) to use our service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Temporary System Logs & Rate Limiting</h2>
          <p>
            For security, abuse prevention, and rate-limiting enforcement, our servers record standard technical request metadata (such as IP hashes, request timestamps, and user-agent strings). These temporary logs are automatically purged on a rolling schedule.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Cookies & Local Storage</h2>
          <p>
            We use browser local storage exclusively to remember your preferred visual theme (dark mode or light mode). We do not store tracking cookies or persistent identifiers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Third-Party Analytics & Ads</h2>
          <p>
            We may utilize privacy-respecting analytics services or standard advertisement partners (such as Google AdSense) to support website operation. Third-party ad providers may place cookies according to their respective privacy policies.
          </p>
        </section>
      </div>
    </div>
  );
}
