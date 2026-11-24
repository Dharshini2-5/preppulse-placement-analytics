import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function GradientText({
  children,
  colors = ['#10B981', '#06B6D4', '#38BDF8', '#F59E0B', '#10B981'],
  lightColors = ['#059669', '#0891B2', '#0284C7', '#D97706', '#059669'],
  className = '',
}) {
  const { isDark } = useTheme();
  const stops = isDark ? colors : lightColors;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent animate-gradient-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${stops.join(', ')})`,
      }}
    >
      {children}
    </span>
  );
}
