import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/constants';

/**
 * MissingParamsScreen — Shown when URL params are missing or invalid.
 *
 * Provides a generic, non-broken experience instead of showing
 * "undefined" in the greeting text.
 */
export function MissingParamsScreen() {
  return (
    <motion.div
      className="missing-params-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
    >
      <span className="missing-params-icon" aria-hidden="true">🔗</span>
      <h1 className="missing-params-title">Invalid Survey Link</h1>
      <p className="missing-params-message">
        This survey link appears to be incomplete or expired. Please use the
        link provided in your email or text message to share your feedback.
      </p>
    </motion.div>
  );
}
