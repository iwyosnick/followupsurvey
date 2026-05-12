import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SurveyParamsSchema } from '@/types';
import type { SurveyParams, SurveyStep } from '@/types';
import { submitSurveyResponse } from '@/services/surveyService';
import { GreetingScreen } from '@/components/forms/GreetingScreen';
import { PositiveFeedbackScreen } from '@/components/forms/PositiveFeedbackScreen';
import { NegativeFeedbackScreen } from '@/components/forms/NegativeFeedbackScreen';
import { SubmittedScreen } from '@/components/forms/SubmittedScreen';
import { ErrorScreen } from '@/components/forms/ErrorScreen';
import { MissingParamsScreen } from '@/components/forms/MissingParamsScreen';

/**
 * SurveyFlow — The main orchestrator for the survey micro-app.
 *
 * Manages the step state machine:
 *   RATING → (submit) → POSITIVE | NEGATIVE → (submit feedback) → SUBMITTED
 *                                                                   ↳ ERROR
 *
 * URL params are validated with Zod on mount. If invalid, the user
 * sees the MissingParamsScreen fallback instead of broken text.
 */
export function SurveyFlow() {
  const [step, setStep] = useState<SurveyStep>('RATING');
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /** Parse and validate URL params once on mount. */
  const params = useMemo<SurveyParams | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const raw = {
      client_id: searchParams.get('client_id') ?? '',
      loved_one: searchParams.get('loved_one') ?? '',
      facility: searchParams.get('facility') ?? '',
    };

    const result = SurveyParamsSchema.safeParse(raw);
    return result.success ? result.data : null;
  }, []);

  /**
   * handleRatingSubmit — Writes the rating to Supabase, then branches:
   *   4-5 stars → POSITIVE screen (with feedback_text: null)
   *   1-3 stars → NEGATIVE screen (rating saved, feedback pending)
   *
   * Why we submit the rating immediately for the positive path:
   * The user may close the tab after seeing the Google Review CTA.
   * We capture the data point before they leave.
   */
  const handleRatingSubmit = useCallback(async () => {
    if (!params || rating === 0) return;
    setIsSubmitting(true);

    const isPositive = rating >= 4;

    try {
      // Immediate insert for both paths prevents data loss if user abandons
      // the negative feedback screen.
      await submitSurveyResponse({
        client_id: params.client_id,
        loved_one: params.loved_one,
        facility: params.facility,
        rating,
        feedback_text: null,
      });

      setIsSubmitting(false);
      setStep(isPositive ? 'POSITIVE' : 'NEGATIVE');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setIsSubmitting(false);
      setErrorMessage(message);
      setStep('ERROR');
    }
  }, [params, rating]);

  /**
   * handleFeedbackSubmit — Writes the negative rating + feedback text to Supabase.
   */
  const handleFeedbackSubmit = useCallback(
    async (feedbackText: string | null) => {
      if (!params) return;
      setIsSubmitting(true);

      try {
        // This will now UPSERT if the rating was already inserted
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

  /** Reset to the rating screen for retry. */
  const handleRetry = useCallback(() => {
    setErrorMessage('');
    setStep('RATING');
  }, []);

  // ── Invalid params fallback ──
  if (!params) {
    return (
      <div className="survey-card">
        <MissingParamsScreen />
      </div>
    );
  }

  return (
    <div className="survey-card">
      <AnimatePresence mode="wait">
        {step === 'RATING' && (
          <GreetingScreen
            key="greeting"
            params={params}
            onRate={setRating}
            onSubmit={handleRatingSubmit}
            rating={rating}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'POSITIVE' && (
          <PositiveFeedbackScreen key="positive" />
        )}

        {step === 'NEGATIVE' && (
          <NegativeFeedbackScreen
            key="negative"
            onSubmitFeedback={handleFeedbackSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'SUBMITTED' && (
          <SubmittedScreen key="submitted" />
        )}

        {step === 'ERROR' && (
          <ErrorScreen
            key="error"
            message={errorMessage}
            onRetry={handleRetry}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
