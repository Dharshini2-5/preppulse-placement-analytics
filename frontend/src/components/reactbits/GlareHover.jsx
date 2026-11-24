import React from 'react';

export function GlareHover({ children, className = '' }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-full top-0 z-20 block w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 group-hover:left-[125%] group-hover:opacity-100"
        style={{ left: '-75%' }}
      />
      {children}
    </div>
  );
}
