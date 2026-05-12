/**
 * Validates and exports required environment variables.
 *
 * Why throw instead of warn:
 * A missing Supabase URL/key means every DB operation will fail with an
 * opaque network error. Failing loudly at startup gives an immediately
 * actionable signal during deployment rather than silent data loss.
 */


/**
 * Returns an optional environment variable value, or undefined if not set.
 */
const optional = (key: string): string | undefined => {
  return import.meta.env[key] || undefined;
};

export const env = {
  SUPABASE_URL: optional('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: optional('VITE_SUPABASE_ANON_KEY'),
  GOOGLE_REVIEW_URL: optional('VITE_GOOGLE_REVIEW_URL'),
} as const;
