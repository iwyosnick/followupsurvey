import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/constants';
import { Check } from 'lucide-react';

/**
 * SubmittedScreen — Shown after a successful database write.
 *
 * Both positive and negative paths end here.
 * Displays a confirmation checkmark with a spring animation.
 */
export function SubmittedScreen() {
  return (
    <motion.div
      className="submitted-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
    >
      <motion.div
        className="submitted-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.15 }}
      >
        <Check strokeWidth={3} />
      </motion.div>

      <h2 className="submitted-title">Thank you!</h2>
      <p className="submitted-message">
        Your feedback has been received. We appreciate you taking the time
        to help us improve care for every family.
      </p>
    </motion.div>
  );
}
