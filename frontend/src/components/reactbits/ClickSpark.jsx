import React, { useEffect, useRef } from 'react';

export function ClickSpark({
  sparkColor = '#10B981',
  secondaryColor = '#06B6D4',
  sparkCount = 10,
  sparkRadius = 26,
  duration = 420,
  children,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onClick = (e) => {
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() * 0.25 - 0.125);
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          angle,
          start: now,
          color: i % 2 === 0 ? sparkColor : secondaryColor,
        });
      }
    };

    window.addEventListener('pointerdown', onClick);

    const render = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = now - spark.start;
        if (elapsed >= duration) return false;
        const t = elapsed / duration;
        const ease = 1 - Math.pow(1 - t, 3);
        const dist = ease * sparkRadius;
        const lineLen = (1 - t) * 10;

        const x1 = spark.x + Math.cos(spark.angle) * dist;
        const y1 = spark.y + Math.sin(spark.angle) * dist;
        const x2 = spark.x + Math.cos(spark.angle) * (dist + lineLen);
        const y2 = spark.y + Math.sin(spark.angle) * (dist + lineLen);

        ctx.strokeStyle = spark.color;
        ctx.globalAlpha = 1 - t;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onClick);
    };
  }, [sparkColor, secondaryColor, sparkCount, sparkRadius, duration]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999]"
      />
      {children}
    </>
  );
}
