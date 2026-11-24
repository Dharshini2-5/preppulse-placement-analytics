import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function BorderBeam({
  children,
  className = '',
  innerClassName = '',
  duration = '7s',
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-[1.5px] ${
        isDark ? '' : 'shadow-[0_18px_42px_-16px_rgba(15,23,42,0.13)]'
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-[120%] ${isDark ? 'opacity-85' : 'opacity-75'}`}
        style={{
          background: isDark
            ? 'conic-gradient(from 0deg, transparent 0deg, transparent 275deg, #10B981 315deg, #06B6D4 345deg, #F59E0B 358deg, transparent 360deg)'
            : 'conic-gradient(from 0deg, rgba(15,23,42,0.08) 0deg, rgba(15,23,42,0.08) 265deg, #059669 310deg, #0891B2 342deg, #F59E0B 356deg, rgba(15,23,42,0.08) 360deg)',
          animation: `border-beam-spin ${duration} linear infinite`,
        }}
      />
      <div
        className={`relative z-10 h-full w-full rounded-[14.5px] transition-colors duration-300 ${
          isDark ? 'bg-[#080F20]' : 'bg-white/95 backdrop-blur-xl'
        } ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
