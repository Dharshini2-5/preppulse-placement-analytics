import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export function AnimatedList({
  items = [],
  renderItem,
  emptyMessage = 'No records available yet.',
  className = '',
}) {
  const { isDark } = useTheme();

  if (!items.length) {
    return (
      <div
        className={`rounded-xl border border-dashed p-6 text-center text-sm ${
          isDark
            ? 'border-slate-700/70 text-slate-400'
            : 'border-slate-300 text-slate-500 bg-slate-50/70'
        }`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((item, idx) => (
        <motion.div
          key={item.id ?? idx}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.32,
            delay: Math.min(idx * 0.045, 0.35),
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{ x: 4 }}
          className={`rounded-xl border transition-colors ${
            isDark
              ? 'border-slate-800/80 bg-slate-900/55 hover:border-emerald-400/35 hover:bg-slate-900/85'
              : 'border-slate-200/85 bg-white/85 hover:border-emerald-500/40 hover:bg-emerald-50/35 shadow-2xs'
          }`}
        >
          {renderItem(item, idx)}
        </motion.div>
      ))}
    </div>
  );
}
