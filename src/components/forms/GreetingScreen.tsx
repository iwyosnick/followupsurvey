import { motion } from 'framer-motion';
import { StarRating } from '@/components/ui/StarRating';
import { EASE_OUT_EXPO } from '@/constants';
import type { SurveyParams } from '@/types';

interface GreetingScreenProps {
  params: SurveyParams;
  onRate: (rating: number) => void;
  onSubmit: () => void;
  rating: number;
  isSubmitting: boolean;
}

/**
 * GreetingScreen — Screen 1 of the survey flow.
 *
 * Greets the family using the URL-extracted params and presents
 * the interactive star rating. The submit button only appears
 * after a rating is selected.
 */
export function GreetingScreen({
  params,
  onRate,
  onSubmit,
  rating,
  isSubmitting,
}: GreetingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
    >
      <div className="greeting-header">
        <span className="greeting-emoji" aria-hidden="true">👋</span>
        <h1 className="greeting-title">
          How was <span className="greeting-highlight">{params.loved_one}</span>'s
          experience at <span className="greeting-highlight">{params.facility}</span>?
        </h1>
        <p className="greeting-subtitle">
          Your honest feedback helps us improve care for every family.
        </p>
      </div>

      <StarRating onRate={onRate} disabled={isSubmitting} />

      {rating > 0 && (
        <motion.button
          className="submit-button"
          onClick={onSubmit}
          disabled={isSubmitting}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          id="submit-rating-button"
        >
          {isSubmitting ? (
            <>
              <div className="spinner" />
              Submitting...
            </>
          ) : (
            'Continue'
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
