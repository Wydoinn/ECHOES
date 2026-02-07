
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../components/SoundManager';
import { TransformationResult, EmotionalData } from '../types';
import { haptics } from '../utils/haptics';
import { generateRelicPDF } from '../utils/pdfGenerator';

interface FinalReleaseProps {
  onRestart: () => void;
  result?: TransformationResult;
  originalData?: EmotionalData;
  reducedMotion?: boolean;
}

const FinalRelease: React.FC<FinalReleaseProps> = ({ onRestart, result, originalData, reducedMotion = false }) => {
  const [isReleased, setIsReleased] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { playWhoosh, playSparkle, playChime } = useSound();

  // Hold Duration in ms
  const HOLD_DURATION = 3000;
  const INTERVAL_MS = 20;

  const startHold = () => {
    if (isReleased) return;
    setIsHolding(true);
    haptics.transformation(); // Start rising vibration pattern

    let elapsed = 0;
    holdIntervalRef.current = setInterval(() => {
        elapsed += INTERVAL_MS;
        const p = Math.min(100, (elapsed / HOLD_DURATION) * 100);
        setProgress(p);

        if (p >= 100) {
            triggerRelease();
            stopHold();
        }
    }, INTERVAL_MS);
  };

  const stopHold = () => {
    setIsHolding(false);
    if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
    }
    // If not released, reset progress
    if (!isReleased) {
        setProgress(0);
    }
  };

  const particleRafRef = useRef<number | null>(null);

  const startParticleExplosion = () => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Full screen canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Gold, White, Purple, Pink
    const palette = ['#fbbf24', '#ffffff', '#8b5cf6', '#ec4899'];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      decay: number;
      gravity: number;
      type: string;
      angle: number;
      tilt: number;
      tiltAngle: number;
      tiltAngleIncrement: number;
    }

    const particles: Particle[] = [];

    // Create 500 particles for cathartic burst
    for (let i = 0; i < 500; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 10 + Math.random() * 20; // High initial velocity (10-30)

        // Determine particle type
        const typeRand = Math.random();
        let type = 'simple';
        if (typeRand > 0.6) type = 'spiral';
        else if (typeRand > 0.8) type = 'confetti';

        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            size: 2 + Math.random() * 6, // 2-8px
            color: palette[Math.floor(Math.random() * palette.length)] ?? '#ffffff',
            life: 1.0,
            decay: 0.005 + Math.random() * 0.01, // ~2-3 seconds life
            gravity: 0.1 + Math.random() * 0.2,
            type: type,
            // Spiral props
            angle: angle,
            // Confetti props
            tilt: Math.random() * 360,
            tiltAngle: Math.random() * Math.PI,
            tiltAngleIncrement: Math.random() * 0.1 + 0.05
        });
    }

    const animate = () => {
        if (!ctx) return;

        // Trail effect
        ctx.fillStyle = 'rgba(13, 6, 23, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let activeParticles = 0;

        particles.forEach(p => {
            if (p.life > 0) {
                activeParticles++;

                // Physics based on type
                if (p.type === 'spiral') {
                    // Add tangential force for spiral
                    p.vx += Math.cos(p.angle + Math.PI/2) * 0.5;
                    p.vy += Math.sin(p.angle + Math.PI/2) * 0.5;
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                    p.x += p.vx;
                    p.y += p.vy;
                } else if (p.type === 'confetti') {
                    p.tiltAngle += p.tiltAngleIncrement;
                    // Flutter effect
                    p.y += (Math.cos(p.tiltAngle) + 1 + p.size/2) * 0.5;
                    p.x += Math.sin(p.tiltAngle) * 2;
                    p.vx *= 0.9;
                    p.vy *= 0.9;
                    p.x += p.vx;
                    p.y += p.vy;
                } else {
                    // Simple ballistic
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.vx *= 0.96; // Drag
                    p.vy *= 0.96;
                }

                p.life -= p.decay;

                // Render
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;

                if (p.type === 'confetti') {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.tilt + p.tiltAngle); // Rotating confetti
                    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        });

        if (activeParticles > 0) {
            particleRafRef.current = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    particleRafRef.current = requestAnimationFrame(animate);
  };

  const triggerRelease = () => {
    setIsReleased(true);
    playWhoosh();
    setTimeout(() => playChime(), 100); // Layered chime slightly delayed
    setTimeout(() => playSparkle(), 300); // Sparkle texture
    haptics.release();
    startParticleExplosion();

    // Final blinding flash logic
    setTimeout(() => {
        onRestart(); // Reset App
    }, 4000); // Wait for whiteout
  };

  const handlePDFExport = async () => {
      if (!result || !originalData) return;
      setIsGeneratingPdf(true);
      try {
        await generateRelicPDF(result, originalData);
      } catch (err) {
        console.error('Failed to generate PDF:', err);
        // Could show a toast notification here
      } finally {
        setIsGeneratingPdf(false);
      }
  };

  // Prevent context menu on long press (scoped to hold button only)
  const holdButtonRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = holdButtonRef.current;
    if (!el) return;
    const preventContext = (e: Event) => e.preventDefault();
    el.addEventListener('contextmenu', preventContext);
    return () => el.removeEventListener('contextmenu', preventContext);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-20 overflow-hidden pb-20">

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

      {/* Whiteout Overlay */}
      <AnimatePresence>
        {isReleased && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 3.5, ease: "easeInOut" }} // Slower fade to allow particles to be seen
                className="fixed inset-0 bg-white z-[9999] pointer-events-none flex items-center justify-center"
            >
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="text-black font-serif-display text-4xl tracking-[0.5em] uppercase"
                >
                    Released
                </motion.h1>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isReleased ? (
            <motion.div
                key="hold-button"
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center z-40 relative px-4"
            >
                {/* PDF Export before release */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handlePDFExport}
                    disabled={isGeneratingPdf}
                    className="mb-16 text-[10px] uppercase tracking-[0.2em] text-purple-300/50 hover:text-purple-200/90 transition-all duration-500 border-b border-transparent hover:border-purple-400/40 pb-1 disabled:opacity-30"
                >
                    {isGeneratingPdf ? "Crafting Relic..." : "✦ Save Your Journey (PDF) ✦"}
                </motion.button>

                {/* The Hold Button */}
                <div
                    ref={holdButtonRef}
                    className="relative w-80 h-80 flex items-center justify-center cursor-pointer touch-none select-none"
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {/* Outer Premium Rings */}
                    <div className="absolute inset-0 rounded-full border border-purple-500/10 scale-100" />
                    <div className="absolute inset-4 rounded-full border border-purple-400/10 scale-100 opacity-50" />
                    <motion.div
                        className="absolute inset-[-10px] rounded-full border border-purple-500/15"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Progress Ring */}
                    <svg
                        className="absolute inset-0 w-full h-full rotate-[-90deg] pointer-events-none z-20"
                        viewBox="0 0 256 256"
                    >
                        {/* Background Track */}
                        <circle
                            cx="128" cy="128" r="120"
                            stroke="rgba(255,255,255,0.02)" strokeWidth="1" fill="none"
                        />
                        {/* Animated Progress - THEME COLOR PURPLE GRADIENT */}
                        <motion.circle
                            cx="128" cy="128" r="120"
                            stroke="url(#gradient-theme)" strokeWidth="4" fill="none"
                            strokeLinecap="round"
                            strokeDasharray="753.98"
                            strokeDashoffset={753.98 - (753.98 * progress) / 100}
                            className="transition-all duration-[20ms] ease-linear drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
                        />
                         <defs>
                            <linearGradient id="gradient-theme" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#d946ef" /> {/* Fuchsia 500 */}
                                <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet 500 */}
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Central Orb */}
                    <motion.div
                        className="w-52 h-52 rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_0_80px_rgba(147,51,234,0.2)] backdrop-blur-sm"
                        style={{
                            background: 'radial-gradient(circle at center, rgba(30, 10, 50, 0.8) 0%, rgba(13, 6, 23, 0.95) 100%)',
                            border: '1px solid rgba(139,92,246,0.15)'
                        }}
                        animate={isHolding ? { scale: 0.96 } : { scale: 1 }}
                    >
                         {/* Internal animated glow */}
                         <motion.div
                             className="absolute inset-0 bg-gradient-to-tr from-purple-500/15 to-fuchsia-500/10"
                             animate={{ opacity: [0.3, 0.6, 0.3] }}
                             transition={{ duration: 3, repeat: Infinity }}
                         />

                        {/* Shimmer */}
                        <motion.div
                             className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-300/5 to-transparent"
                             animate={{ top: ['100%', '-100%'] }}
                             transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                        />

                        <div className="text-center relative z-10 pointer-events-none">
                            <span className="block text-[9px] uppercase tracking-[0.3em] text-purple-200/50 mb-3">
                                {isHolding ? "Holding..." : "Hold to"}
                            </span>
                            <span className="font-serif-display text-2xl text-transparent bg-clip-text bg-gradient-to-br from-purple-100 via-white to-purple-200/80 tracking-[0.2em] drop-shadow-md">
                                RELEASE
                            </span>
                        </div>
                    </motion.div>

                    {/* Outer Pulse */}
                    {!reducedMotion && !isHolding && (
                        <div className="absolute inset-8 border border-purple-500/15 rounded-full animate-ping-slow pointer-events-none" />
                    )}
                </div>

                <p className="mt-12 text-purple-200/40 text-[10px] tracking-[0.2em] uppercase">
                    {isHolding ? "Letting go..." : "Hold circle to release"}
                </p>

            </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
};

export default FinalRelease;
