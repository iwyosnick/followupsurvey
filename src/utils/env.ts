/**
 * Validates and exports environment variables.
 *
 * VITE_WEB3FORMS_ACCESS_KEY — Required in production to deliver survey
 * results via email. Optional locally so devs can test the UI without
 * configuring an email provider.
 *
 * VITE_GOOGLE_REVIEW_URL — The client's Google Business short link.
 * When set, the positive-feedback screen shows a "Leave a Review" CTA.
 */

/**
 * Returns an optional environment variable value, or undefined if not set.
 */
const optional = (key: string): string | undefined => {
  return import.meta.env[key] || undefined;
};

export const env = {
  WEB3FORMS_ACCESS_KEY: optional('VITE_WEB3FORMS_ACCESS_KEY'),
  GOOGLE_REVIEW_URL: optional('VITE_GOOGLE_REVIEW_URL'),
} as const;
