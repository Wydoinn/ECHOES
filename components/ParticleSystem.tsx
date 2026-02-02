
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

      stars.forEach(star => {
        star.x += star.vx * star.z;
        star.y += star.vy * star.z;

        const dx = star.x - mx;
        const dy = star.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          star.x += (dx / dist) * force * 2.5 * star.z;
          star.y += (dy / dist) * force * 2.5 * star.z;
        }

        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        if (star.y > height + 10) star.y = -10;

        const twinkle = Math.sin(time * 0.001 + star.phase);
        const alpha = star.baseAlpha + (twinkle * 0.1);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * star.z, 0, Math.PI * 2);

        // Use dynamic color prop
        ctx.fillStyle = `rgba(${color}, ${Math.max(0, alpha)})`;
        ctx.fill();

        if (star.z > 1.5) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = `rgba(${color}, 0.3)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
      });

      requestAnimationFrame(draw);
    };

    resizeCanvas();
    initStars();
    requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
      resizeCanvas();
      initStars();
    });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
};

export default ParticleSystem;
