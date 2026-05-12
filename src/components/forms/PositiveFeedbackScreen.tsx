import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/constants';
import { ExternalLink } from 'lucide-react';
import { env } from '@/utils/env';

/**
 * PositiveFeedbackScreen — Shown after a 4-5 star rating is submitted.
 *
 * Encourages the user to leave a public Google Review.
 * The review URL comes from the VITE_GOOGLE_REVIEW_URL env var.
 * If no URL is configured, shows a thank-you without the CTA.
 */
export function PositiveFeedbackScreen() {
  const reviewUrl = env.GOOGLE_REVIEW_URL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
    >
      <div className="positive-header">
        <motion.span
          className="positive-emoji"
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        >
          🎉
        </motion.span>
        <h2 className="positive-title">We're so glad to hear that!</h2>
      </div>

      <p className="positive-message">
        Thank you for sharing your experience. It truly means the world to our team
        and helps other families make confident decisions.
      </p>

      {reviewUrl ? (
        <motion.a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="google-review-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id="google-review-cta"
        >
          <ExternalLink size={18} />
          Leave a Google Review
        </motion.a>
      ) : (
        <p className="positive-message" style={{ textAlign: 'center', marginTop: '1rem' }}>
          Thank you for your time!
        </p>
      )}
    </motion.div>
  );
}
