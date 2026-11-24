import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export function PillNav({
  items = [],
  activeId,
  onSelect,
  layoutGroup = 'pill-nav',
  className = '',
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-1 backdrop-blur-md transition-colors ${
        isDark
          ? 'border-slate-800/90 bg-slate-950/75'
          : 'border-slate-200/90 bg-slate-100/90'
      } ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            data-keep-light-text={isActive && !isDark ? 'true' : undefined}
            className={`relative z-10 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? isDark
                  ? 'text-slate-950 font-semibold'
                  : 'text-white font-semibold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutGroup}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                className={`absolute inset-0 -z-10 rounded-lg ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-[0_4px_12px_rgba(5,150,105,0.28)]'
                }`}
              />
            )}
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
