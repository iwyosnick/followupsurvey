import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/constants';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

/**
 * ErrorScreen — Shown when a Web3Forms submission fails.
 *
 * Provides a retry button and a user-friendly error message.
 */
export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
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
        {message}
      </p>
      <button className="retry-button" onClick={onRetry} id="retry-button">
        <RotateCcw size={16} />
        Try Again
      </button>
    </motion.div>
  );
}
