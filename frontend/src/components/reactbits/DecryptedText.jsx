import React, { useEffect, useState, useCallback } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+';

export function DecryptedText({
  text = '',
  speed = 28,
  triggerOnHover = true,
  className = '',
}) {
  const [display, setDisplay] = useState(text);

  const runDecrypt = useCallback(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );
      iteration += 0.6;
      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplay(text);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    const cleanup = runDecrypt();
    return cleanup;
  }, [runDecrypt]);

  return (
    <span
      onMouseEnter={triggerOnHover ? runDecrypt : undefined}
      className={`font-mono ${className}`}
    >
      {display}
    </span>
  );
}
