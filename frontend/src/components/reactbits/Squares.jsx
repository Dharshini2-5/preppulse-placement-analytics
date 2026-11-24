import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function Squares({
  squareSize = 46,
  borderColor,
  hoverFillColor,
  speed = 0.28,
  className = '',
}) {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);

  const resolvedBorder =
    borderColor || (isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.055)');
  const resolvedHover =
    hoverFillColor || (isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(5, 150, 105, 0.09)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let offsetX = 0;
    let offsetY = 0;
    let hoveredCell = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hoveredCell = {
        col: Math.floor((x + offsetX) / squareSize),
        row: Math.floor((y + offsetY) / squareSize),
      };
    };

    const onMouseLeave = () => {
      hoveredCell = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      offsetX = (offsetX + speed) % squareSize;
      offsetY = (offsetY + speed * 0.65) % squareSize;

      const cols = Math.ceil(canvas.width / squareSize) + 2;
      const rows = Math.ceil(canvas.height / squareSize) + 2;

      ctx.strokeStyle = resolvedBorder;
      ctx.lineWidth = 1;

      for (let c = -1; c < cols; c++) {
        for (let r = -1; r < rows; r++) {
          const x = c * squareSize - offsetX;
          const y = r * squareSize - offsetY;

          if (hoveredCell && hoveredCell.col === c && hoveredCell.row === r) {
            ctx.fillStyle = resolvedHover;
            ctx.fillRect(x, y, squareSize, squareSize);
          }
          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [squareSize, resolvedBorder, resolvedHover, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 opacity-85 ${className}`}
    />
  );
}
