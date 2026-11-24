import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export function TiltedCard({ children, maxTilt = 10, className = '' }) {
  const { isDark } = useTheme();
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hovering: false });

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * maxTilt * 2,
      ry: (px - 0.5) * maxTilt * 2,
      gx: px * 100,
      gy: py * 100,
      hovering: true,
    });
  };

  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, hovering: false });
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry, scale: tilt.hovering ? 1.015 : 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative h-full overflow-hidden rounded-2xl glass-panel ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: tilt.hovering ? (isDark ? 0.55 : 0.38) : 0,
            background: isDark
              ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(6, 182, 212, 0.22), transparent 58%)`
              : `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(5, 150, 105, 0.16), transparent 58%)`,
          }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    </div>
  );
}
