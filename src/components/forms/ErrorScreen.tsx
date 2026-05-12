import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/constants';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

/**
 * ErrorScreen — Shown when a Supabase upsert fails.
 *
 * Provides a retry button and a user-friendly error message.
 * Note: The DUPLICATE_SUBMISSION path was removed because .upsert() with
 * onConflict never throws a unique constraint violation (23505).
 */
export function ErrorScreen({ message: _message, onRetry }: ErrorScreenProps) {
  return (
    <motion.div
      className="error-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
    >
      <AlertCircle className="error-icon" />
      <h2 className="error-title">Something went wrong</h2>
      <p className="error-message">
        We couldn't save your feedback. Please check your connection and try again.
      </p>
      <button className="retry-button" onClick={onRetry} id="retry-button">
        <RotateCcw size={16} />
        Try Again
      </button>
    </motion.div>
  );
}
