import React from 'react';
import { motion } from 'framer-motion';

export function BlurText({ text = '', delay = 0.06, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, filter: 'blur(12px)', y: 12 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
            delay: index * delay,
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
