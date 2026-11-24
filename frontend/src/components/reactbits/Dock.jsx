import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export function Dock({ items = [], activeId, onSelect, className = '' }) {
  const { isDark } = useTheme();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 ${className}`}>
      <div
        onMouseLeave={() => setHoveredIdx(null)}
        className={`flex items-end gap-2 rounded-2xl border px-3.5 py-2.5 backdrop-blur-2xl transition-colors duration-300 ${
          isDark
            ? 'border-emerald-400/20 bg-[#070D1D]/90 shadow-[0_18px_50px_rgba(0,0,0,0.65)]'
            : 'border-slate-200/90 bg-white/88 shadow-[0_18px_45px_rgba(15,23,42,0.14),0_2px_6px_rgba(15,23,42,0.05)]'
        }`}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;
          const dist = hoveredIdx === null ? 99 : Math.abs(hoveredIdx - idx);
          const scale = dist === 0 ? 1.32 : dist === 1 ? 1.14 : 1;
          const lift = dist === 0 ? -8 : dist === 1 ? -3 : 0;

          return (
            <div key={item.id} className="relative flex flex-col items-center">
              {hoveredIdx === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-keep-light-text="true"
                  className="pointer-events-none absolute -top-10 whitespace-nowrap rounded-lg border border-slate-700/80 bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg"
                >
                  {item.label}
                </motion.div>
              )}
              <motion.button
                type="button"
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={() => onSelect?.(item.id)}
                animate={{ scale, y: lift }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'border-emerald-400/60 bg-gradient-to-br from-emerald-500/25 to-cyan-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                      : 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 text-emerald-700 shadow-[0_6px_16px_rgba(5,150,105,0.2)]'
                    : isDark
                    ? 'border-slate-700/60 bg-slate-900/70 text-slate-300 hover:border-cyan-400/40 hover:text-white'
                    : 'border-slate-200 bg-slate-50/90 text-slate-600 hover:border-emerald-400/60 hover:bg-white hover:text-slate-900'
                }`}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <span
                    data-keep-light-text="true"
                    className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-xs"
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
              <span
                className={`mt-1 h-1 w-1 rounded-full transition-opacity ${
                  isActive ? 'bg-emerald-500 opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
