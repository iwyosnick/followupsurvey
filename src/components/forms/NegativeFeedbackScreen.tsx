import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/constants';

interface NegativeFeedbackScreenProps {
  onSubmitFeedback: (text: string | null) => void;
  isSubmitting: boolean;
}

/**
 * NegativeFeedbackScreen — Shown after a 1-3 star rating is submitted.
 *
 * Presents an empathetic message and a private textarea for the family
 * to share what went wrong. This feedback is sent directly to the
 * broker via Web3Forms email.
 */
export function NegativeFeedbackScreen({
  onSubmitFeedback,
  isSubmitting,
}: NegativeFeedbackScreenProps) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmitFeedback(feedback.trim() || null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
    >
      <div className="negative-header">
        <motion.span
          className="negative-emoji"
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        >
          💙
        </motion.span>
        <h2 className="negative-title">We're sorry to hear that</h2>
      </div>

      <p className="negative-message">
        Your experience matters to us. Please share any details below so we can
        make it right. This feedback is <strong>completely private</strong> and goes
        directly to our care team.
      </p>

      <textarea
        className="feedback-textarea"
        placeholder="What could we have done better?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={isSubmitting}
        aria-label="Private feedback about your experience"
        id="feedback-textarea"
        maxLength={2000}
      />

      <motion.button
        className="submit-button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        whileHover={isSubmitting ? {} : { scale: 1.02 }}
        whileTap={isSubmitting ? {} : { scale: 0.98 }}
        id="submit-feedback-button"
      >
        {isSubmitting ? (
          <>
            <div className="spinner" />
            Sending...
          </>
        ) : (
          'Send Private Feedback'
        )}
      </motion.button>
    </motion.div>
  );
}
