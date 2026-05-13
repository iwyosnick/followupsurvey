import { useState, useCallback } from 'react';
import type { SurveyParams, SurveyStep } from '@/types';
import { submitSurveyResponse } from '@/services/surveyService';

/**
 * The full return shape of useSurveyFlow.
 * Defined explicitly so that SurveyFlow.tsx can rely on a stable contract
 * without needing to inspect hook internals.
 */
export interface UseSurveyFlowReturn {
  step: SurveyStep;
  rating: number;
  isSubmitting: boolean;
  errorMessage: string;
  setRating: (r: number) => void;
  handleRatingSubmit: () => Promise<void>;
  handleFeedbackSubmit: (text: string | null) => Promise<void>;
  handleRetry: () => void;
}

/**
 * useSurveyFlow — Owns the survey step state machine and submission logic.
 *
 * State machine:
 *   RATING → (4-5★) → submit email immediately → POSITIVE
 *   RATING → (1-3★) → skip submission           → NEGATIVE
 *   NEGATIVE → submit with feedback text         → SUBMITTED
 *                                                ↳ ERROR (on API failure)
 *   ERROR → retry                                → RATING
 *
 * Submission strategy:
 *   - Positive path (4-5 stars): Email sent immediately on rating click,
 *     then the user sees the Google Review CTA. This prevents data loss
 *     if they close the tab after seeing the CTA.
 *   - Negative path (1-3 stars): NO email on rating click. The user is
 *     routed to the text feedback screen first. The email is sent only
 *     when they click "Send Private Feedback", including both the rating
 *     and the text. Trade-off: if they abandon the feedback screen, the
 *     negative rating is lost. This prevents duplicate emails.
 *
 * Why no dependency injection for submitSurveyResponse:
 * There is no test suite today. Hard-importing keeps this hook simple.
 * Refactor to an injectable parameter when unit tests are introduced.
 *
 * @param params - Validated survey params from URL (client_id, loved_one, facility).
 */
export function useSurveyFlow(params: SurveyParams): UseSurveyFlowReturn {
  const [step, setStep] = useState<SurveyStep>('RATING');
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * handleRatingSubmit — Branches on rating value:
   *   ≥ 4 → submit email, advance to POSITIVE.
   *   < 4 → skip submission, advance to NEGATIVE feedback screen.
   */
  const handleRatingSubmit = useCallback(async () => {
    if (rating === 0) return;
    const isPositive = rating >= 4;

    if (isPositive) {
      setIsSubmitting(true);
      try {
        await submitSurveyResponse({
          client_id: params.client_id,
          loved_one: params.loved_one,
          facility: params.facility,
          rating,
          feedback_text: null,
        });
        setIsSubmitting(false);
        setStep('POSITIVE');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setIsSubmitting(false);
        setErrorMessage(message);
        setStep('ERROR');
      }
    } else {
      setStep('NEGATIVE');
    }
  }, [params, rating]);

  /**
   * handleFeedbackSubmit — Sends the negative rating + feedback text.
   * This is the only submission point for the negative path.
   */
  const handleFeedbackSubmit = useCallback(
    async (feedbackText: string | null) => {
      setIsSubmitting(true);
      try {
        await submitSurveyResponse({
          client_id: params.client_id,
          loved_one: params.loved_one,
          facility: params.facility,
          rating,
          feedback_text: feedbackText,
        });
        setIsSubmitting(false);
        setStep('SUBMITTED');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setIsSubmitting(false);
        setErrorMessage(message);
        setStep('ERROR');
      }
    },
    [params, rating]
  );

  /** handleRetry — Resets error state and returns to the rating screen. */
  const handleRetry = useCallback(() => {
    setErrorMessage('');
    setStep('RATING');
  }, []);

  return {
    step,
    rating,
    isSubmitting,
    errorMessage,
    setRating,
    handleRatingSubmit,
    handleFeedbackSubmit,
    handleRetry,
  };
}
