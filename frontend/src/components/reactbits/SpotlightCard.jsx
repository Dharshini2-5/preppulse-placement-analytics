import React, { useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function SpotlightCard({
  children,
  spotlightColor = 'rgba(16, 185, 129, 0.22)',
  className = '',
  onClick,
}) {
  const { isDark } = useTheme();
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const resolvedSpotlight = isDark
    ? spotlightColor
    : spotlightColor.replace(/0\.\d+\)/, '0.11)');

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl glass-panel transition-all duration-300 ${
        isDark
          ? 'hover:border-emerald-400/35'
          : 'hover:border-emerald-500/35 hover:shadow-[0_16px_38px_-14px_rgba(15,23,42,0.13)]'
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${resolvedSpotlight}, transparent 62%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
