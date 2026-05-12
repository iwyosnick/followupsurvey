import { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  /** Called when the user selects a rating (1-5). */
  onRate: (rating: number) => void;
  /** Whether the rating input is disabled (e.g., during submission). */
  disabled?: boolean;
}

const LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Okay',
  4: 'Great',
  5: 'Excellent',
};

/**
 * StarRating — An interactive, accessible 5-star input.
 *
 * Why a custom implementation over a library:
 * We need precise control over Framer Motion animations, ARIA semantics,
 * and keyboard navigation for this single-use micro-app. A library would
 * add unnecessary weight.
 */
export function StarRating({ onRate, disabled = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);
  const [selected, setSelected] = useState<number>(0);

  const handleSelect = useCallback(
    (value: number) => {
      if (disabled) return;
      setSelected(value);
      onRate(value);
    },
    [disabled, onRate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, value: number) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(value);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.min(value + 1, 5);
        handleSelect(next);
        const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
        buttons?.[next - 1]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const prev = Math.max(value - 1, 1);
        handleSelect(prev);
        const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
        buttons?.[prev - 1]?.focus();
      }
    },
    [disabled, handleSelect]
  );

  const displayValue = hovered || selected;

  return (
    <div className="star-rating-container">
      <div
        className="star-rating-group"
        role="radiogroup"
        aria-label="Rate your experience from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const isActive = value <= selected;
          const isHovered = value <= hovered && hovered > 0;

          let stateClass = 'star-icon--empty';
          if (isActive) stateClass = 'star-icon--active';
          else if (isHovered) stateClass = 'star-icon--hovered';

          return (
            <motion.button
              key={value}
              type="button"
              className="star-button"
              role="radio"
              aria-checked={value === selected}
              aria-label={`${value} star${value > 1 ? 's' : ''} — ${LABELS[value]}`}
              tabIndex={value === (selected || 1) ? 0 : -1}
              disabled={disabled}
              onClick={() => handleSelect(value)}
              onMouseEnter={() => !disabled && setHovered(value)}
              onMouseLeave={() => !disabled && setHovered(0)}
              onKeyDown={(e) => handleKeyDown(e, value)}
              whileHover={disabled ? {} : { scale: 1.15 }}
              whileTap={disabled ? {} : { scale: 0.85 }}
            >
              <Star
                className={`star-icon ${stateClass}`}
                fill={isActive || isHovered ? '#FBBF24' : 'none'}
                strokeWidth={1.5}
              />
            </motion.button>
          );
        })}
      </div>
      <span className="star-rating-label" aria-live="polite">
        {displayValue > 0 ? LABELS[displayValue] : 'Tap a star to rate'}
      </span>
    </div>
  );
}
