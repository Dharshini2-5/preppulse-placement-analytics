import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CountUp, DecryptedText, GradientText } from './reactbits';

export function BootSplash({ onDone }) {
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDone?.();
    }, 1550);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 ${
        isDark ? 'bg-[#050914]' : 'bg-[#F8FAFC]'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, rgba(16,185,129,0.16), transparent 55%)'
            : 'radial-gradient(circle at center, rgba(5,150,105,0.12), transparent 55%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="relative flex flex-col items-center text-center"
      >
        <div
          className={`relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-amber-500/10 ${
            isDark
              ? 'border-emerald-400/35 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
              : 'border-emerald-500/35 shadow-[0_14px_38px_rgba(5,150,105,0.2)]'
          }`}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-1.5 rounded-xl border border-dashed border-cyan-500/40"
          />
          <Activity className="h-9 w-9 text-emerald-500 dark:text-emerald-400" />
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight">
          <GradientText>PrepPulse Analytics</GradientText>
        </h1>

        <p className="mt-2 text-xs tracking-[0.22em] text-cyan-700 dark:text-cyan-300/90 uppercase">
          <DecryptedText text="BOOTING READINESS SCORING & RBAC ENGINE" speed={22} triggerOnHover={false} />
        </p>

        <div className="mt-7 w-72">
          <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> Spring Boot + JWT Core
            </span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <CountUp from={0} to={100} duration={1.35} suffix="%" />
            </span>
          </div>
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${isDark ? 'bg-slate-800/90' : 'bg-slate-200'}`}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 shadow-[0_0_16px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="mt-6 text-xs font-mono text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
        >
          Skip intro →
        </button>
      </motion.div>
    </motion.div>
  );
}
