import { getSupabaseClient } from '@/integrations/supabase/client';
import { SurveySubmissionSchema, type SurveySubmission } from '@/types';
import { env } from '@/utils/env';

/**
 * Submits a validated survey response to Supabase.
 *
 * Why Zod validation before insert:
 * URL params are untrusted CRM-generated strings. We validate the full
 * payload at the service boundary to catch malformed or malicious data
 * before it touches the database.
 *
 * @throws Error if validation fails or the Supabase insert returns an error.
 */
export async function submitSurveyResponse(data: SurveySubmission): Promise<void> {
  const validated = SurveySubmissionSchema.parse(data);

  if (!env.SUPABASE_URL) {
    console.warn("Supabase not configured. Bypassing database insert for:", validated);
    // Simulate slight network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('survey_responses')
    .upsert(
      {
        client_id: validated.client_id,
        loved_one: validated.loved_one,
        facility: validated.facility,
        rating: validated.rating,
        feedback_text: validated.feedback_text,
      },
      { onConflict: 'client_id,facility' }
    );

  if (error) {
    throw new Error(`Failed to submit survey: ${error.message}`);
  }
}
