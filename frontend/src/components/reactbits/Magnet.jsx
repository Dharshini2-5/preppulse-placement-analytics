import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function Magnet({ children, strength = 0.28, className = '' }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setOffset({ x: dx * strength, y: dy * strength });
  };

  const onLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 280, damping: 18, mass: 0.4 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
