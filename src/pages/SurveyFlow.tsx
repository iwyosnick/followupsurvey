import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { parseSurveyParams } from '@/utils/parseSurveyParams';
import { useSurveyFlow } from '@/hooks/useSurveyFlow';
import type { SurveyParams } from '@/types';
import { GreetingScreen } from '@/components/forms/GreetingScreen';
import { PositiveFeedbackScreen } from '@/components/forms/PositiveFeedbackScreen';
import { NegativeFeedbackScreen } from '@/components/forms/NegativeFeedbackScreen';
import { SubmittedScreen } from '@/components/forms/SubmittedScreen';
import { ErrorScreen } from '@/components/forms/ErrorScreen';
import { MissingParamsScreen } from '@/components/forms/MissingParamsScreen';

/**
 * SurveyFlow — The root UI orchestrator for the survey micro-app.
 *
 * Responsibility: Parse URL params, guard against invalid state, and
 * delegate rendering to SurveyFlowInner.
 *
 * Why two components:
 * useSurveyFlow requires a non-null `params` argument. If we called
 * useSurveyFlow here and then did an early return for !params, we would
 * violate React's Rules of Hooks (hooks cannot be called conditionally).
 * SurveyFlowInner is called only after params has been validated, so the
 * hook is always called unconditionally within its component tree.
 */
export function SurveyFlow() {
  const params = useMemo(() => parseSurveyParams(), []);

  if (!params) {
    return (
      <div className="survey-card">
        <MissingParamsScreen />
      </div>
    );
  }

  return <SurveyFlowInner params={params} />;
}

/**
 * SurveyFlowInner — Consumes the survey state machine and renders the
 * appropriate screen for the current step.
 *
 * Receives validated params as a prop (never null), which allows
 * useSurveyFlow to be called unconditionally at the top of this component.
 */
function SurveyFlowInner({ params }: { params: SurveyParams }) {
  const {
    step,
    rating,
    isSubmitting,
    errorMessage,
    setRating,
    handleRatingSubmit,
    handleFeedbackSubmit,
    handleRetry,
  } = useSurveyFlow(params);

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
