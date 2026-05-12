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
   * handleRatingSubmit — Branches based on rating:
   *   4-5 stars → Submits email immediately, then shows POSITIVE screen.
   *   1-3 stars → Skips submission, routes to NEGATIVE feedback screen.
   *
   * Why submit immediately for positive:
   * The user may close the tab after seeing the Google Review CTA.
   * We capture the data point before they leave.
   */
  const handleRatingSubmit = useCallback(async () => {
    if (!params || rating === 0) return;

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
      // Negative path: skip submission, go straight to feedback screen
      setStep('NEGATIVE');
    }
  }, [params, rating]);

  /**
   * handleFeedbackSubmit — Sends the negative rating + feedback text
   * via Web3Forms. This is the only submission for the negative path.
   */
  const handleFeedbackSubmit = useCallback(
    async (feedbackText: string | null) => {
      if (!params) return;
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
