
import React, { useEffect, useRef } from 'react';

export type RitualPhase = 'shatter' | 'vortex' | 'coalesce' | 'orb';

interface AlchemicalVortexProps {
  phase: RitualPhase;
  reducedMotion?: boolean;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  // Target positions for morphing
  tx: number;
  ty: number;
  tz: number;
  // Physics
  vx: number;
  vy: number;
  vz: number;
  // Appearance
  size: number;
  baseColor: { r: number; g: number; b: number };
  color: { r: number; g: number; b: number; a: number };
  alphaOffset: number; // For twinkling
}

const PALETTE = {
  gold: { r: 251, g: 191, b: 36 },    // Amber-400
  purple: { r: 139, g: 92, b: 246 },  // Violet-500
  pink: { r: 236, g: 72, b: 153 },    // Pink-500
  blue: { r: 56, g: 189, b: 248 },    // Sky-400
  white: { r: 255, g: 255, b: 255 },
};

const AlchemicalVortex: React.FC<AlchemicalVortexProps> = ({ phase, reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const phaseRef = useRef<RitualPhase>(phase);
  const timeRef = useRef<number>(0);

  // Sync phase ref
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // 3D Projection Helper
    const project = (x: number, y: number, z: number) => {
      const fov = 600;
      const scale = fov / (fov + z);
      // Adjusted vertical position to 42% height (slightly above center)
      return {
        x: width / 2 + x * scale,
        y: height * 0.42 + y * scale,
        scale: scale,
        isVisible: z > -fov // simple clipping
      };
    };

    // Color Lerp Helper
    const lerpColor = (curr: { r: number; g: number; b: number }, target: { r: number; g: number; b: number }, amt: number) => {
      curr.r += (target.r - curr.r) * amt;
      curr.g += (target.g - curr.g) * amt;
      curr.b += (target.b - curr.b) * amt;
    };

    // Initialize System
    const initParticles = () => {
      const count = reducedMotion ? 400 : 1500;
      const particles: Particle3D[] = [];

      for (let i = 0; i < count; i++) {
        // Initial state: Start dispersed
        const spreadX = width * 1.0;
        const spreadY = height * 1.0;
        const spreadZ = 800;

        const x = (Math.random() - 0.5) * spreadX;
        const y = (Math.random() - 0.5) * spreadY;
        const z = (Math.random() - 0.5) * spreadZ;

        // Random palette assignment
        const rand = Math.random();
        let base = PALETTE.purple;
        if (rand > 0.7) base = PALETTE.gold;
        else if (rand > 0.5) base = PALETTE.pink;
        else if (rand > 0.95) base = PALETTE.white;

        particles.push({
          x, y, z,
          tx: x, ty: y, tz: z,
          vx: 0, vy: 0, vz: 0,
          size: Math.random() * 2 + 0.5,
          baseColor: base,
          color: { ...base, a: 0 }, // Start invisible for fade in
          alphaOffset: Math.random() * Math.PI * 2
        });
      }
      particlesRef.current = particles;
    };

    // Update Targets based on Phase (The "Brain" of the animation)
    const updateTargets = (time: number) => {
      const pArr = particlesRef.current;
      const currentPhase = phaseRef.current;
      const count = pArr.length;

      for (let i = 0; i < count; i++) {
        const p = pArr[i];
        if (!p) continue;

        if (currentPhase === 'shatter') {
            // "Diamond Dust" - Suspended luxury
            // A wide, elegant field of drifting particles, not chaotic.
            // Using pseudorandom seed from alphaOffset to give each particle a unique "home" location
            const noiseX = Math.sin(p.alphaOffset * 12.34);
            const noiseY = Math.cos(p.alphaOffset * 56.78);
            const noiseZ = Math.sin(p.alphaOffset * 90.12);

            const spreadX = width * 0.7; // Wide horizontal spread
            const spreadY = height * 0.5; // Moderate vertical spread

            // Very slow, majestic drift
            const speed = 0.0001;
            const t = time * speed;

            // Base position + Drift
            p.tx = (noiseX * spreadX) + Math.sin(t + p.alphaOffset) * 50;
            p.ty = (noiseY * spreadY) + Math.cos(t * 0.9 + p.alphaOffset) * 30;
            p.tz = (noiseZ * 400) + Math.sin(t * 0.5 + p.alphaOffset) * 100;

            // Luxury Colors: Predominantly White/Gold with deep accents
            const rnd = Math.abs(noiseX);
            if (rnd > 0.92) p.baseColor = PALETTE.purple;
            else if (rnd > 0.85) p.baseColor = PALETTE.blue;
            else if (rnd > 0.6) p.baseColor = PALETTE.gold;
            else p.baseColor = PALETTE.white;

        } else if (currentPhase === 'vortex') {
            // Galaxy Spiral / DNA Helix
            const angleOffset = time * 0.002;
            const branch = i % 3; // 3 arms
            const radius = (i / count) * 400 + 50;
            const angle = (i / 100) + angleOffset * (branch + 1) * 2;

            p.tx = Math.cos(angle) * radius;
            p.tz = Math.sin(angle) * radius;
            p.ty = (Math.sin(angle * 3 + time * 0.005) * 50) + ((i/count - 0.5) * 150); // Tighter helix

            // Tilt the galaxy
            const tilt = 0.5;
            const y = p.ty;
            const z = p.tz;
            p.ty = y * Math.cos(tilt) - z * Math.sin(tilt);
            p.tz = y * Math.sin(tilt) + z * Math.cos(tilt);

            // Color Shift -> Gold/Pink energy
            if (radius < 150) p.baseColor = PALETTE.gold;
            else p.baseColor = PALETTE.pink;

        } else if (currentPhase === 'coalesce') {
            // Singularity - Rush to center
            const r = 20 + Math.random() * 50; // Tight core
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            // Orbiting fast around core
            p.tx = r * Math.sin(phi) * Math.cos(theta + time * 0.1);
            p.ty = r * Math.sin(phi) * Math.sin(theta + time * 0.1);
            p.tz = r * Math.cos(phi);

            // Color Shift -> Intense White/Blue
            p.baseColor = PALETTE.white;

        } else if (currentPhase === 'orb') {
             // Solar Sphere
             const r = 180;
             // Fibonnaci Sphere distribution for even surface
             const phi = Math.acos(1 - 2 * (i + 0.5) / count);
             const theta = Math.PI * (1 + Math.sqrt(5)) * i + time * 0.005;

             p.tx = r * Math.sin(phi) * Math.cos(theta);
             p.ty = r * Math.sin(phi) * Math.sin(theta);
             p.tz = r * Math.cos(phi);

             // Pulse effect on radius
             const pulse = Math.sin(time * 0.01 + p.y * 0.05) * 10;
             p.tx *= (1 + pulse/r);
             p.ty *= (1 + pulse/r);
             p.tz *= (1 + pulse/r);

             // Color Shift -> Golden Sun
             p.baseColor = PALETTE.gold;
        }
      }
    };

    const draw = (time: number) => {
      // 1. CLEAR & TRAIL (Darker trail for cleaner look)
      ctx.fillStyle = 'rgba(13, 6, 23, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // 2. SET BLEND MODE for Glow
      ctx.globalCompositeOperation = 'lighter';

      updateTargets(time);

      const pArr = particlesRef.current;
      const count = pArr.length;

      // Easing factor (lower = smoother/slower, higher = snappier)
      const ease = phaseRef.current === 'coalesce' ? 0.08 : 0.04;

      for (let i = 0; i < count; i++) {
        const p = pArr[i];
        if (!p) continue;

        // PHYSICS: Smoothly move p.{x,y,z} towards p.{tx,ty,tz}
        p.x += (p.tx - p.x) * ease;
        p.y += (p.ty - p.y) * ease;
        p.z += (p.tz - p.z) * ease;

        // PROJECTION
        const proj = project(p.x, p.y, p.z);
        if (!proj.isVisible) continue;

        // COLOR & ALPHA
        // Lerp current color to base color
        lerpColor(p.color, p.baseColor, 0.05);

        // Twinkle
        const twinkle = Math.sin(time * 0.005 + p.alphaOffset);
        const alpha = 0.4 + twinkle * 0.3; // Base alpha range 0.4 - 0.7

        // Distance fade
        const distAlpha = Math.min(1, 1000 / (Math.abs(p.z) + 1));

        // RENDER
        const radius = Math.max(0.5, p.size * proj.scale);

        // Use radial gradient for soft particle look (expensive but worth it for < 2000 particles)
        // Optimization: For very small particles, just use fill
        if (radius < 2) {
             ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * distAlpha})`;
             ctx.beginPath();
             ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
             ctx.fill();
        } else {
            const grad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, radius * 2);
            grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * distAlpha})`);
            grad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, radius * 2, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      // Add Central Core Glow for Orb Phase
      if (phaseRef.current === 'orb') {
          const cx = width / 2;
          const cy = height * 0.42; // Match new projection center
          const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 300);
          glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, 300, 0, Math.PI * 2);
          ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';

      timeRef.current = time;
      animationFrameId = requestAnimationFrame((t) => draw(t));
    };

    // Start
    resizeCanvas();
    initParticles();
    animationFrameId = requestAnimationFrame((t) => draw(t));

    window.addEventListener('resize', resizeCanvas);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default AlchemicalVortex;
