import { SurveyParamsSchema } from '@/types';
import type { SurveyParams } from '@/types';

/**
 * Parses and validates survey URL parameters from the current location.
 *
 * Why a plain function and not a hook:
 * This logic has no reactive dependencies. It reads window.location.search
 * once and returns a validated result. The caller wraps it in useMemo([]).
 *
 * Handles double-encoded URLs (e.g. %2520 → %20 → ' ') from CRM systems
 * that apply their own encoding on top of standard URL encoding.
 *
 * @returns Validated SurveyParams if all three required fields are present
 *          and non-empty, or null if validation fails.
 */
export function parseSurveyParams(): SurveyParams | null {
  const searchParams = new URLSearchParams(window.location.search);

  // safeGet handles double-encoded URLs (e.g. %2520 → %20 → ' ').
  // URLSearchParams.get() performs one decode pass automatically;
  // decodeURIComponent applies a second pass for any residual encoding.
  // The try/catch ensures a malformed %XX sequence won't throw.
  const safeGet = (key: string): string => {
    const raw = searchParams.get(key) ?? '';
    try { return decodeURIComponent(raw); } catch { return raw; }
  };

  const raw = {
    client_id: safeGet('client_id'),
    loved_one: safeGet('loved_one'),
    facility: safeGet('facility'),
  };

  const result = SurveyParamsSchema.safeParse(raw);
  return result.success ? result.data : null;
}
