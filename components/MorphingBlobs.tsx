
import React, { useEffect, useRef } from 'react';

interface MorphingBlobsProps {
  reducedMotion?: boolean;
  period?: 'dawn' | 'day' | 'dusk' | 'night';
}

// Palettes for different times of day (R, G, B format)
const palettes = {
  night: [
    { color: '30, 10, 60' },    // Deepest Plum
    { color: '20, 15, 50' },    // Midnight
    { color: '88, 28, 135' },   // Royal Purple
    { color: '49, 46, 129' },   // Indigo
    { color: '15, 23, 42' },    // Slate
  ],
  dawn: [
    { color: '60, 30, 60' },    // Deep Mauve
    { color: '100, 60, 90' },   // Muted Rose
    { color: '180, 100, 100' }, // Soft Clay
    { color: '80, 70, 120' },   // Morning Blue
    { color: '40, 30, 60' },    // Dawn Shadow
  ],
  day: [
    { color: '40, 60, 100' },   // Deep Sky
    { color: '60, 80, 120' },   // Steel Blue
    { color: '100, 100, 140' }, // Overcast
    { color: '30, 40, 80' },    // Deep Blue
    { color: '20, 30, 60' },    // Shadow Blue
  ],
  dusk: [
    { color: '60, 20, 40' },    // Deep Red
    { color: '80, 40, 80' },    // Twilight Purple
    { color: '100, 60, 40' },   // Burnt Orange Shadow
    { color: '40, 30, 80' },    // Evening Blue
    { color: '20, 10, 30' },    // Nightfall
  ]
};

const MorphingBlobs: React.FC<MorphingBlobsProps> = ({ reducedMotion = false, period = 'night' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Initialize blobs with physics and colors based on period
    const currentPalette = palettes[period];

    // We recreate the blob array when period changes to apply new colors smoothly
    // In a more complex version we could lerp colors, but hard switching is fine for page loads
    const blobs = [
      { x: 0.2, y: 0.2, vx: 0.0001, vy: 0.0002, r: 0.6, color: currentPalette[0]?.color ?? '30, 10, 60' },
      { x: 0.8, y: 0.8, vx: -0.0002, vy: -0.0001, r: 0.7, color: currentPalette[1]?.color ?? '20, 15, 50' },
      { x: 0.5, y: 0.5, vx: 0.0001, vy: -0.0001, r: 0.5, color: currentPalette[2]?.color ?? '88, 28, 135' },
      { x: 0.8, y: 0.2, vx: -0.0001, vy: 0.0002, r: 0.45, color: currentPalette[3]?.color ?? '49, 46, 129' },
      { x: 0.2, y: 0.8, vx: 0.0002, vy: -0.0002, r: 0.55, color: currentPalette[4]?.color ?? '15, 23, 42' },
    ];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const animate = () => {
      if (!ctx) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Base background - Subtle shift based on period
      let bg = '#05020a'; // Default Night
      if (period === 'dawn') bg = '#120815';
      if (period === 'day') bg = '#080c15';
      if (period === 'dusk') bg = '#150510';

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Using 'screen' for smooth mixing
      ctx.globalCompositeOperation = 'screen';

      blobs.forEach(b => {
        const oscillationX = Math.sin(time * 0.001 + b.r * 10) * 0.05;
        const oscillationY = Math.cos(time * 0.0015 + b.r * 10) * 0.05;

        const cx = (b.x + oscillationX) * width;
        const cy = (b.y + oscillationY) * height;

        const pulse = Math.sin(time * 0.0005) * 0.05 + 1;
        const radius = b.r * Math.max(width, height) * 0.7 * pulse;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

        gradient.addColorStop(0, `rgba(${b.color}, 0.5)`);
        gradient.addColorStop(0.4, `rgba(${b.color}, 0.2)`);
        gradient.addColorStop(0.8, `rgba(${b.color}, 0.05)`);
        gradient.addColorStop(1, `rgba(${b.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        b.x += b.vx;
        b.y += b.vy;

        if (b.x < -0.2 || b.x > 1.2) b.vx *= -1;
        if (b.y < -0.2 || b.y > 1.2) b.vy *= -1;
      });

      ctx.globalCompositeOperation = 'source-over';

      if (!reducedMotion) {
        time += 1;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    resize();
    animate();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        if (reducedMotion) animate();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion, period]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 0.7 }}
    />
  );
};

export default MorphingBlobs;
