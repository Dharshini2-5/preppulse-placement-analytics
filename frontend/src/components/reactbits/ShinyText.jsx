import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function ShinyText({ text, className = '', children }) {
  const { isDark } = useTheme();

  return (
    <span
      className={`inline-block bg-clip-text text-transparent animate-shiny ${className}`}
      style={{
        backgroundImage: isDark
          ? 'linear-gradient(110deg, #94a3b8 30%, #ffffff 48%, #34d399 54%, #94a3b8 70%)'
          : 'linear-gradient(110deg, #334155 25%, #059669 48%, #0891B2 56%, #334155 75%)',
      }}
    >
      {children || text}
    </span>
  );
}
