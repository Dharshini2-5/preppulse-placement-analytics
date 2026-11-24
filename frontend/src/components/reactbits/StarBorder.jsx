import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function StarBorder({
  as: Component = 'button',
  color = '#10B981',
  secondaryColor = '#06B6D4',
  className = '',
  innerClassName = '',
  children,
  ...props
}) {
  const { isDark } = useTheme();

  return (
    <Component
      className={`relative inline-flex overflow-hidden rounded-xl p-[1.5px] group cursor-pointer focus:outline-none ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 left-0 h-14 w-[240%] opacity-90"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 45%)`,
          animation: 'star-orbit-top 4.2s linear infinite alternate',
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 right-0 h-14 w-[240%] opacity-90"
        style={{
          background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 45%)`,
          animation: 'star-orbit-bottom 4.2s linear infinite alternate',
        }}
      />
      <span
        data-keep-light-text="true"
        className={`btn-on-accent relative z-10 inline-flex items-center justify-center gap-2 rounded-[10.5px] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
          isDark
            ? 'bg-[#070E1F] group-hover:bg-[#0B152C]'
            : 'bg-slate-900 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.45)] group-hover:bg-slate-800'
        } ${innerClassName}`}
      >
        {children}
      </span>
    </Component>
  );
}
