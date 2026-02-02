
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './SoundManager';
import { haptics } from '../utils/haptics';

export type ReleaseMethod = 'burn' | 'dissolve' | 'release' | null;

interface LetterReleaseProps {
  isActive: boolean;
  method: ReleaseMethod;
  onComplete: () => void;
  letterContent: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = {
  burn: ['#ff6b35', '#f7931e', '#ffcc00', '#ff4500', '#ff8c00', '#ffa500'],
  dissolve: ['#4fc3f7', '#81d4fa', '#b3e5fc', '#e1f5fe', '#ffffff', '#00bcd4'],
  release: ['#ffd700', '#ffffff', '#e1bee7', '#ce93d8', '#ffeb3b', '#fff59d'],
};

const LetterRelease: React.FC<LetterReleaseProps> = ({ isActive, method, onComplete, letterContent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [phase, setPhase] = useState<'idle' | 'animating' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  const { playWhoosh, playSparkle } = useSound();

  const createParticle = useCallback((centerX: number, centerY: number, width: number, height: number, methodType: ReleaseMethod): Particle => {
    const colors = COLORS[methodType || 'release'];
    const angle = Math.random() * Math.PI * 2;

    // Start position within the letter bounds
    const startX = centerX + (Math.random() - 0.5) * width * 0.9;
    const startY = centerY + (Math.random() - 0.5) * height * 0.9;

    let vx = 0, vy = 0;

    if (methodType === 'burn') {
      vx = (Math.random() - 0.5) * 4;
      vy = -(3 + Math.random() * 6); // Rise up
    } else if (methodType === 'dissolve') {
      const speed = 1 + Math.random() * 3;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else {
      vx = (Math.random() - 0.5) * 3;
      vy = -(2 + Math.random() * 5); // Float up
    }

    return {
      x: startX,
      y: startY,
      vx,
      vy,
      size: 3 + Math.random() * 8,
      life: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff',
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    };
  }, []);

  useEffect(() => {
    if (!isActive || !method) {
      setPhase('idle');
      setProgress(0);
      particlesRef.current = [];
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Start animation
    setPhase('animating');
    setProgress(0);
    playWhoosh();
    haptics.transformation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Letter position (center of screen)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const letterWidth = Math.min(600, window.innerWidth * 0.8);
    const letterHeight = Math.min(400, window.innerHeight * 0.6);

    // Initialize particles
    particlesRef.current = [];
    const initialCount = method === 'burn' ? 150 : method === 'dissolve' ? 200 : 120;
    for (let i = 0; i < initialCount; i++) {
      particlesRef.current.push(createParticle(centerX, centerY, letterWidth, letterHeight, method));
    }

    startTimeRef.current = Date.now();
    const duration = 4500; // 4.5 seconds

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / duration);
      setProgress(currentProgress);

      // Clear canvas with fade trail
      if (method === 'burn') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      } else if (method === 'dissolve') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles during animation
      if (currentProgress < 0.75) {
        const spawnRate = method === 'burn' ? 8 : method === 'dissolve' ? 6 : 5;
        for (let i = 0; i < spawnRate; i++) {
          particlesRef.current.push(createParticle(centerX, centerY, letterWidth * (1 - currentProgress * 0.8), letterHeight * (1 - currentProgress * 0.8), method));
        }
      }

      // Update and draw particles
      ctx.globalCompositeOperation = 'lighter';

      particlesRef.current = particlesRef.current.filter(p => {
        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (method === 'burn') {
          p.vy -= 0.08; // Accelerate upward (heat)
          p.vx += (Math.random() - 0.5) * 0.5; // Flicker
          p.life -= 0.012;
        } else if (method === 'dissolve') {
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.vy += 0.03; // Slight sink
          p.life -= 0.008;
        } else {
          p.vy -= 0.03; // Float up
          p.vx += (Math.random() - 0.5) * 0.2;
          p.life -= 0.01;
        }

        if (p.life <= 0) return false;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.life * 0.9;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (method === 'burn') {
          // Glowing ember
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.2, p.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (method === 'dissolve') {
          // Water droplet
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          // Glow
          ctx.globalAlpha = p.life * 0.3;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Light sparkle
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.4, p.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      ctx.globalCompositeOperation = 'source-over';

      // Continue or complete
      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPhase('complete');
        playSparkle();
        haptics.release();
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, method, onComplete, playWhoosh, playSparkle, createParticle]);

  if (!isActive || !method) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 0.5 }}
      />

      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10"
      />

      {/* Animated Letter */}
      <AnimatePresence>
        {phase === 'animating' && (
          <motion.div
            className="absolute top-1/2 left-1/2 z-20 w-[90vw] max-w-[600px] p-8 md:p-12 rounded-sm pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, #f4f1ea 0%, #e8e4db 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            initial={{
              x: '-50%',
              y: '-50%',
              scale: 1,
              opacity: 1,
              filter: 'brightness(1)'
            }}
            animate={{
              x: '-50%',
              y: method === 'burn' ? '-60%' : method === 'release' ? '-70%' : '-50%',
              scale: method === 'dissolve' ? 1.05 : 0.85,
              opacity: 0,
              filter: method === 'burn'
                ? 'brightness(2) sepia(1) saturate(3) hue-rotate(-10deg)'
                : method === 'dissolve'
                  ? 'brightness(1.5) blur(20px)'
                  : 'brightness(3) blur(10px)',
              rotateX: method === 'release' ? 15 : 0,
            }}
            transition={{
              duration: 3.5,
              ease: 'easeInOut'
            }}
          >
            {/* Method-specific overlay effects */}
            {method === 'burn' && (
              <motion.div
                className="absolute inset-0 rounded-sm overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Fire edge creeping up */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600 via-red-500 to-transparent"
                  initial={{ height: '0%' }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 3, ease: 'easeIn' }}
                />
                {/* Char marks */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 1 }}
                />
              </motion.div>
            )}

            {method === 'dissolve' && (
              <motion.div
                className="absolute inset-0 rounded-sm overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 2 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(79, 195, 247, 0.4) 0%, transparent 70%)',
                  }}
                />
              </motion.div>
            )}

            {method === 'release' && (
              <motion.div
                className="absolute inset-0 rounded-sm overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 1.5 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.5) 0%, rgba(255,255,255,0.3) 50%, transparent 80%)',
                  }}
                />
              </motion.div>
            )}

            {/* Letter content preview */}
            <div className="relative z-10">
              <div className="text-center mb-4 border-b border-[#2c1810]/20 pb-2">
                <span className="text-xs tracking-[0.3em] uppercase text-[#2c1810]/40">The Message</span>
              </div>
              <p className="text-lg md:text-xl leading-relaxed text-[#2c1810]/70 font-handwriting line-clamp-4">
                {letterContent.slice(0, 150)}...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {phase === 'animating' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                method === 'burn' ? 'bg-orange-500' :
                method === 'dissolve' ? 'bg-cyan-400' :
                'bg-yellow-400'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-center text-white/50 text-xs mt-2 uppercase tracking-widest">
            {method === 'burn' ? 'Burning...' : method === 'dissolve' ? 'Dissolving...' : 'Releasing...'}
          </p>
        </div>
      )}

      {/* Completion Message */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30"
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 1, repeat: 1 }}
            >
              {method === 'burn' ? '🔥' : method === 'dissolve' ? '💧' : '✨'}
            </motion.div>
            <h3 className="text-3xl font-serif-display text-white mb-3">
              {method === 'burn' ? 'Transformed by Fire' : method === 'dissolve' ? 'Returned to Flow' : 'Released to Light'}
            </h3>
            <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
              {method === 'burn'
                ? 'The old has become ash, making way for new growth.'
                : method === 'dissolve'
                  ? 'The words have merged with the infinite.'
                  : 'Your intentions now dance among the stars.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LetterRelease;
