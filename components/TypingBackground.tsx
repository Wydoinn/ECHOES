
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface TypingBackgroundHandle {
  addRipple: (intensity: number) => void;
}

const TypingBackground = forwardRef<TypingBackgroundHandle, object>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<{ id: number; size: number; opacity: number; speed: number }[]>([]);

  useImperativeHandle(ref, () => ({
    addRipple: (intensity: number) => {
      // Intensity 0 to 1
      // Adjusted opacity calculation to prevent blowout when typing fast
      // Previous: 0.3 + intensity * 0.4 (Max 0.7) -> causes whiteout with screen blend mode
      // New: 0.1 + intensity * 0.25 (Max 0.35) -> much subtler stacking
      ripplesRef.current.push({
        id: Date.now() + Math.random(),
        size: 10,
        opacity: 0.1 + intensity * 0.25,
        speed: 2 + intensity * 5,
      });
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw ripples
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ripplesRef.current.forEach((ripple, index) => {
        ripple.size += ripple.speed;
        ripple.opacity -= 0.005;

        if (ripple.opacity <= 0) {
          ripplesRef.current.splice(index, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${ripple.opacity})`; // Purple-ish
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.size * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(236, 72, 153, ${ripple.opacity * 0.5})`; // Pink-ish border
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
});

export default TypingBackground;
