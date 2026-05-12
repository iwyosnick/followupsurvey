import { z } from 'zod';

/**
 * Schema for validating URL parameters from the CRM.
 * All three fields are required for a personalized greeting.
 */
export const SurveyParamsSchema = z.object({
  client_id: z.string().min(1, 'client_id is required').max(200),
  loved_one: z.string().min(1, 'loved_one is required').max(200),
  facility: z.string().min(1, 'facility is required').max(200),
});

export type SurveyParams = z.infer<typeof SurveyParamsSchema>;

/**
 * Schema for validating the full survey submission payload
 * before writing to Supabase.
 */
export const SurveySubmissionSchema = z.object({
  client_id: z.string().min(1),
  loved_one: z.string().min(1),
  facility: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  feedback_text: z.string().max(2000).nullable(),
});

export type SurveySubmission = z.infer<typeof SurveySubmissionSchema>;

/** Survey flow step states */
export type SurveyStep = 'RATING' | 'POSITIVE' | 'NEGATIVE' | 'SUBMITTED' | 'ERROR';
