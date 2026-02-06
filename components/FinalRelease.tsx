
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './SoundManager';
import { TransformationResult, EmotionalData } from '../types';
import { haptics } from '../utils/haptics';
import { generateRelicPDF } from '../utils/pdfGenerator';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      color: string;
      size: number;
      life: number;
      type: string;
      rotation?: number;
      rotationSpeed?: number;
      spiralAngle?: number;
      spiralSpeed?: number;
      decay: number;
      gravity: number;
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
                    ctx.rotate((p.tilt ?? 0) + p.tiltAngle); // Rotating confetti
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
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    animate();
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
      await generateRelicPDF(result, originalData);
      setIsGeneratingPdf(false);
  };

  // Prevent context menu on long press
  useEffect(() => {
    const preventContext = (e: Event) => e.preventDefault();
    window.addEventListener('contextmenu', preventContext);
    return () => window.removeEventListener('contextmenu', preventContext);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-20 overflow-hidden pb-20">

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

      {/* Premium Whiteout Overlay */}
      <AnimatePresence>
        {isReleased && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="fixed inset-0 bg-gradient-to-b from-[#f4e5b2] via-white to-[#f4e5b2] z-[9999] pointer-events-none flex items-center justify-center"
            >
                <motion.div className="text-center">
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1, duration: 1.5 }}
                        className="w-24 h-[1px] mx-auto mb-8 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
                    />
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[#2c1810] font-serif-display text-4xl md:text-5xl tracking-[0.5em] uppercase"
                    >
                        Released
                    </motion.h1>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1.8, duration: 1.5 }}
                        className="w-16 h-[1px] mx-auto mt-8 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
                    />
                </motion.div>
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
                    className="mb-20 text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/40 hover:text-[#d4af37]/80 transition-all duration-500 border-b border-transparent hover:border-[#d4af37]/30 pb-1 disabled:opacity-30 font-medium"
                >
                    {isGeneratingPdf ? t('common.loading') : `✦ ${t('revelation.downloadRelic')} (PDF) ✦`}
                </motion.button>

                {/* The Hold Button */}
                <div
                    className="relative w-80 h-80 flex items-center justify-center cursor-pointer touch-none select-none"
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {/* Outer Premium Rings */}
                    <div className="absolute inset-0 rounded-full border border-[#d4af37]/10 scale-100" />
                    <div className="absolute inset-4 rounded-full border border-[#d4af37]/5 scale-100 opacity-60" />
                    <motion.div
                        className="absolute inset-[-10px] rounded-full border border-[#d4af37]/15"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
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
                        className="w-52 h-52 rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.15)] backdrop-blur-sm"
                        style={{
                            background: 'radial-gradient(circle at center, rgba(30, 15, 50, 0.9) 0%, rgba(13, 6, 23, 0.98) 100%)',
                            border: '1px solid rgba(212,175,55,0.15)'
                        }}
                        animate={isHolding ? { scale: 0.95, borderColor: 'rgba(212,175,55,0.4)' } : { scale: 1 }}
                    >
                         {/* Internal animated glow */}
                         <motion.div
                             className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/10 via-transparent to-purple-500/10"
                             animate={{ opacity: [0.3, 0.6, 0.3] }}
                             transition={{ duration: 4, repeat: Infinity }}
                         />

                        {/* Shimmer */}
                        <motion.div
                             className="absolute inset-0 bg-gradient-to-t from-transparent via-[#d4af37]/5 to-transparent"
                             animate={{ top: ['100%', '-100%'] }}
                             transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        />

                        <div className="text-center relative z-10 pointer-events-none">
                            <span className="block text-[9px] uppercase tracking-[0.4em] text-[#d4af37]/50 mb-3 font-medium">
                                {isHolding ? t('common.loading') : "Hold to"}
                            </span>
                            <span className="font-serif-display text-2xl text-transparent bg-clip-text bg-gradient-to-br from-[#f4e5b2] via-[#d4af37] to-white/60 tracking-[0.25em] drop-shadow-md">
                                RELEASE
                            </span>
                        </div>
                    </motion.div>

                    {/* Outer Pulse */}
                    {!reducedMotion && !isHolding && (
                        <div className="absolute inset-8 border border-[#d4af37]/15 rounded-full animate-ping-slow pointer-events-none" />
                    )}
                </div>

                <p className="mt-14 text-[#d4af37]/40 text-[10px] tracking-[0.3em] uppercase font-medium">
                    {isHolding ? "Letting go..." : "Hold circle to release"}
                </p>

            </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
};

export default FinalRelease;
