import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { CountUp } from './reactbits';

export function ReadinessGauge({ score = 0, band = 'Building Core', targetTier = 'FAANG', size = 210 }) {
  const { isDark } = useTheme();
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const strokeDashoffset = circumference * (1 - clamped / 100);

  const bandColor =
    clamped >= 84
      ? isDark
        ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15'
        : 'text-emerald-700 border-emerald-500/35 bg-emerald-50'
      : clamped >= 72
      ? isDark
        ? 'text-cyan-300 border-cyan-400/40 bg-cyan-500/15'
        : 'text-cyan-700 border-cyan-500/35 bg-cyan-50'
      : clamped >= 58
      ? isDark
        ? 'text-amber-300 border-amber-400/40 bg-amber-500/15'
        : 'text-amber-700 border-amber-500/35 bg-amber-50'
      : isDark
      ? 'text-rose-300 border-rose-400/40 bg-rose-500/15'
      : 'text-rose-700 border-rose-500/35 bg-rose-50';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="readinessRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#10B981' : '#059669'} />
              <stop offset="55%" stopColor={isDark ? '#06B6D4' : '#0891B2'} />
              <stop offset="100%" stopColor={isDark ? '#F59E0B' : '#D97706'} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(226, 232, 240, 0.95)'}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#readinessRingGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              filter: isDark
                ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.55))'
                : 'drop-shadow(0 4px 10px rgba(5, 150, 105, 0.28))',
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400">
            Readiness
          </span>
          <div className={`font-display text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CountUp to={clamped} decimals={1} />
          </div>
          <span className="mt-0.5 text-[11px] font-mono text-slate-400">TARGET: {targetTier}</span>
        </div>
      </div>

      <span className={`mt-3 rounded-full border px-3.5 py-1 text-xs font-semibold ${bandColor}`}>
        {band}
      </span>
    </div>
  );
}
