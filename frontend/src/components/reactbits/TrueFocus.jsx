import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export function TrueFocus({
  items = ['JWT RBAC', 'Dynamic Readiness', 'AI Recommendations'],
  intervalMs = 2400,
  borderColor = '#10B981',
  className = '',
}) {
  const { isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const resolvedBorder = isDark ? borderColor : '#059669';

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  useEffect(() => {
    const updateRect = () => {
      const container = containerRef.current;
      const target = itemRefs.current[activeIndex];
      if (!container || !target) return;
      const cRect = container.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      setFocusRect({
        x: tRect.left - cRect.left - 8,
        y: tRect.top - cRect.top - 5,
        width: tRect.width + 16,
        height: tRect.height + 10,
      });
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [activeIndex, items]);

  return (
    <div ref={containerRef} className={`relative inline-flex flex-wrap items-center gap-4 py-1.5 ${className}`}>
      {items.map((word, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={word}
            type="button"
            ref={(el) => (itemRefs.current[idx] = el)}
            onMouseEnter={() => setActiveIndex(idx)}
            className={`relative px-2 py-0.5 text-sm md:text-base font-display font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
              isActive
                ? isDark
                  ? 'text-white blur-0 scale-105'
                  : 'text-slate-900 blur-0 scale-105'
                : 'text-slate-400 blur-[1.2px] opacity-65 hover:opacity-90'
            }`}
          >
            {word}
          </button>
        );
      })}
      {focusRect.width > 0 && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0"
          animate={{
            x: focusRect.x,
            y: focusRect.y,
            width: focusRect.width,
            height: focusRect.height,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: resolvedBorder }} />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: resolvedBorder }} />
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: resolvedBorder }} />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: resolvedBorder }} />
        </motion.div>
      )}
    </div>
  );
}
