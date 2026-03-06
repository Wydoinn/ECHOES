
import * as React from 'react';
import { useEffect, useRef } from 'react';

interface ParticleSystemProps {
    color?: string; // "R, G, B" string
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ color = "230, 210, 255" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      baseAlpha: number;
      phase: number;
      vx: number;
      vy: number;
    }

    let stars: Star[] = [];

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const initStars = () => {
      const count = Math.min(350, (width * height) / 6000);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 1.5 + 0.5,
          size: Math.random() * 1.5,
          baseAlpha: Math.random() * 0.5 + 0.1,
          phase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const maxDist = 300;
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        if (!star) continue;

        star.x += star.vx * star.z;
        star.y += star.vy * star.z;

        const dx = star.x - mx;
        const dy = star.y - my;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const force = (maxDist - dist) / maxDist;
          const invDist = 1 / (dist || 1);
          star.x += dx * invDist * force * 2.5 * star.z;
          star.y += dy * invDist * force * 2.5 * star.z;
        }

        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        if (star.y > height + 10) star.y = -10;

        const twinkle = Math.sin(time * 0.001 + star.phase);
        const alpha = star.baseAlpha + (twinkle * 0.1);

        if (alpha <= 0) continue;

        const radius = star.size * star.z;
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();

        // Only add glow for the brightest, largest stars
        if (star.z > 1.5 && alpha > 0.3) {
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(star.x, star.y, radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, 0.15)`;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    initStars();
    let animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      resizeCanvas();
      initStars();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
};

export default ParticleSystem;
