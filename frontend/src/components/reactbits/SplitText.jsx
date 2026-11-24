import React from 'react';
import { motion } from 'framer-motion';

export function SplitText({
  text = '',
  mode = 'words',
  delay = 0.045,
  className = '',
}) {
  const items = mode === 'chars' ? Array.from(text) : text.split(' ');

  return (
    <span className={`inline-flex flex-wrap ${mode === 'words' ? 'gap-x-[0.28em]' : ''} ${className}`}>
      {items.map((segment, idx) => (
        <motion.span
          key={`${segment}-${idx}`}
          initial={{ opacity: 0, y: 22, rotateX: -35 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 22,
            delay: idx * delay,
          }}
          className="inline-block will-change-transform"
        >
          {segment === ' ' ? '\u00A0' : segment}
        </motion.span>
      ))}
    </span>
  );
}
