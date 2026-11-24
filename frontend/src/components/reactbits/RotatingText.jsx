import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function RotatingText({
  texts = [],
  intervalMs = 2600,
  className = '',
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [texts.length, intervalMs]);

  return (
    <span className={`relative inline-flex overflow-hidden align-bottom ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[index]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="inline-block"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
