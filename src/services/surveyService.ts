import { SurveySubmissionSchema, type SurveySubmission } from '@/types';
import { env } from '@/utils/env';

/**
 * Typed shape of a Web3Forms API response.
 * Prevents implicit `any` from response.json() and documents
 * the API contract for future maintainers.
 */
interface Web3FormsResponse {
  success: boolean;
  message?: string;
}

/**
 * Converts a numeric rating (1-5) to a visual star string for email subjects.
 * Example: 4 → "⭐⭐⭐⭐"
 */
function ratingToStars(rating: number): string {
  return '⭐'.repeat(rating);
}

/**
 * Submits a validated survey response via Web3Forms.
 *
 * Why Zod validation before submit:
 * URL params are untrusted CRM-generated strings. We validate the full
 * payload at the service boundary to catch malformed or malicious data
 * before it leaves the client.
 *
 * If the Web3Forms access key is not configured, the submission is
 * silently bypassed with a console warning. This allows the app to
 * function during local development without email credentials.
 *
 * @throws Error if validation fails or the Web3Forms API returns an error.
 */
export async function submitSurveyResponse(data: SurveySubmission): Promise<void> {
  const validated = SurveySubmissionSchema.parse(data);

  if (!env.WEB3FORMS_ACCESS_KEY) {
    console.warn('Web3Forms not configured. Bypassing email for:', validated);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const feedbackLine = validated.feedback_text
    ? `\n\nFeedback:\n${validated.feedback_text}`
    : '';

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: env.WEB3FORMS_ACCESS_KEY,
      subject: `Survey: ${ratingToStars(validated.rating)} for ${validated.facility}`,
      from_name: 'ElderGuide Survey',

      // --- Honeypot spam protection (Web3Forms built-in) ---
      botcheck: '',

      // --- Survey data ---
      Rating: `${validated.rating} / 5`,
      'Client ID': validated.client_id,
      'Loved One': validated.loved_one,
      Facility: validated.facility,
      Feedback: validated.feedback_text ?? 'N/A',

      // --- Full message body for the email ---
      message: `New survey response for ${validated.loved_one} at ${validated.facility}.\n\nRating: ${ratingToStars(validated.rating)} (${validated.rating}/5)${feedbackLine}`,
    }),
  });

  // Guard against non-JSON responses (e.g. Cloudflare 502 HTML error pages)
  // before attempting to parse. Prevents a cryptic SyntaxError from propagating.
  if (!response.ok) {
    throw new Error(`Web3Forms API error: HTTP ${response.status} ${response.statusText}`);
  }

  const result: Web3FormsResponse = await response.json();

  if (!result.success) {
    throw new Error(`Failed to submit survey: ${result.message ?? 'Unknown API error'}`);
  }
}
