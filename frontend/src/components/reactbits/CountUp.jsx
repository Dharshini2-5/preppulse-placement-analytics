import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

export function CountUp({
  to = 0,
  from = 0,
  duration = 1.1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const controls = animate(from, Number(to) || 0, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(latest),
    });
    return () => controls.stop();
  }, [from, to, duration]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString();

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
