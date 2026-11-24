import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ compact = false, className = '', onToggleAfter }) {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = () => {
    toggleTheme();
    onToggleAfter?.(isDark ? 'light' : 'dark');
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        role="switch"
        aria-checked={!isDark}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
          isDark
            ? 'border-slate-700/80 bg-slate-900/80 text-amber-300 hover:border-emerald-400/50 hover:bg-slate-800/90'
            : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:border-emerald-500/50 hover:bg-slate-50'
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -60, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 60, scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="flex items-center justify-center"
            >
              <Moon className="h-4 w-4 text-cyan-300" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 60, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -60, scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="flex items-center justify-center"
            >
              <Sun className="h-4 w-4 text-amber-500" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`group relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full border p-1 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
        isDark
          ? 'border-slate-700/90 bg-slate-900/90 hover:border-emerald-400/60 hover:shadow-[0_0_16px_rgba(16,185,129,0.22)]'
          : 'border-slate-200/90 bg-slate-100/95 shadow-inner hover:border-emerald-500/60 hover:shadow-[0_0_16px_rgba(5,150,105,0.16)]'
      } ${className}`}
    >
      {/* Background guide icons */}
      <span className="pointer-events-none flex w-full items-center justify-between px-1.5">
        <Moon
          className={`h-3.5 w-3.5 transition-opacity duration-200 ${
            isDark ? 'opacity-25 text-slate-400' : 'opacity-45 text-slate-500'
          }`}
        />
        <Sun
          className={`h-3.5 w-3.5 transition-opacity duration-200 ${
            isDark ? 'opacity-45 text-amber-300' : 'opacity-25 text-amber-500'
          }`}
        />
      </span>

      {/* Animated Spring Thumb */}
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 460, damping: 28 }}
        data-keep-light-text="true"
        className={`absolute top-1 flex h-[26px] w-[26px] items-center justify-center rounded-full shadow-md ${
          isDark
            ? 'left-1 bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950'
            : 'left-[37px] bg-gradient-to-br from-amber-400 to-orange-500 text-white'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="thumb-moon"
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <Moon className="h-3.5 w-3.5 text-slate-950 stroke-[2.4]" />
            </motion.span>
          ) : (
            <motion.span
              key="thumb-sun"
              initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <Sun className="h-3.5 w-3.5 text-white stroke-[2.4]" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
