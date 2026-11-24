import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function Aurora({
  colorStops = ['#10B981', '#06B6D4', '#F59E0B'],
  lightColorStops = ['#34D399', '#38BDF8', '#FCD34D'],
  opacity = 0.28,
  className = '',
}) {
  const { isDark } = useTheme();
  const stops = isDark ? colorStops : lightColorStops;
  const effectiveOpacity = isDark ? opacity : Math.min(0.24, opacity * 0.85);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden z-0 transition-opacity duration-500 ${className}`}
    >
      <div
        className="absolute -top-[22%] -left-[12%] h-[62vh] w-[62vw] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle at 40% 40%, ${stops[0]}, transparent 68%)`,
          opacity: effectiveOpacity,
          animation: 'aurora-drift-1 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[18%] -right-[15%] h-[58vh] w-[58vw] rounded-full blur-[130px]"
        style={{
          background: `radial-gradient(circle at 60% 45%, ${stops[1]}, transparent 70%)`,
          opacity: effectiveOpacity * 0.9,
          animation: 'aurora-drift-2 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-[20%] left-[24%] h-[50vh] w-[52vw] rounded-full blur-[135px]"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${stops[2]}, transparent 72%)`,
          opacity: effectiveOpacity * 0.55,
          animation: 'aurora-drift-1 26s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at top, transparent 20%, #050914 92%)'
            : 'radial-gradient(ellipse at top, rgba(255,255,255,0.22) 15%, rgba(248,250,252,0.88) 92%)',
        }}
      />
    </div>
  );
}
