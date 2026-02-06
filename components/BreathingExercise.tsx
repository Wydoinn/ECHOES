import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './SoundManager';
import { haptics } from '../utils/haptics';
import { useTranslation } from 'react-i18next';
import HomeButton from './HomeButton';

interface BreathingExerciseProps {
  onComplete: () => void;
  onSkip: () => void;
  onRestart: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete, onSkip, onRestart }) => {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycleCount, setCycleCount] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const { t } = useTranslation();

  const { playBreathPhase } = useSound();

  // 4 seconds per phase x 3 phases = 12s per cycle
  // 4 cycles = 48s total
  const TOTAL_CYCLES = 4;
  const PHASE_DURATION = 4000; // ms

  useEffect(() => {
    // Start automatically after a short delay
    const startTimer = setTimeout(() => {
        setIsStarted(true);
    }, 1000);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!isStarted) return;

    let timer: ReturnType<typeof setTimeout>;

    const runPhase = (currentPhase: Phase) => {
        // Audio & Haptics trigger at start of phase
        playBreathPhase(currentPhase, PHASE_DURATION / 1000);
        haptics.type(); // Gentle tap on phase change

        timer = setTimeout(() => {
            if (currentPhase === 'inhale') {
                setPhase('hold');
            } else if (currentPhase === 'hold') {
                setPhase('exhale');
            } else if (currentPhase === 'exhale') {
                // End of cycle
                if (cycleCount < TOTAL_CYCLES) {
                    setCycleCount(c => c + 1);
                    setPhase('inhale');
                } else {
                    onComplete();
                }
            }
        }, PHASE_DURATION);
    };

    runPhase(phase);

    return () => clearTimeout(timer);
  }, [phase, cycleCount, isStarted, onComplete, playBreathPhase, TOTAL_CYCLES]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0d0617]/70 backdrop-blur-md"
    >
      {/* Home Button */}
      <div className="fixed top-6 left-6 z-50">
        <HomeButton onClick={onRestart} />
      </div>
      <div className="flex flex-col items-center justify-center">

          {/* Main Breathing Circle */}
          <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
              {/* Outer Guide Rings - centered on the orb */}
              <div className="absolute inset-[-20px] border border-[#d4af37]/10 rounded-full" />
              <div className="absolute inset-[-40px] border border-[#d4af37]/5 rounded-full" />

              {/* Expanding/Contracting Orb with premium gradient */}
              <motion.div
                animate={{
                    scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
                    opacity: phase === 'inhale' ? 0.9 : phase === 'hold' ? 0.9 : 0.4,
                    filter: phase === 'hold' ? 'blur(8px)' : 'blur(15px)'
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut"
                }}
                className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-[#d4af37]/80 via-cyan-400/60 to-purple-600/80 shadow-[0_0_60px_rgba(212,175,55,0.3),0_0_100px_rgba(34,211,238,0.2)]"
              />

              {/* Inner Focus Dot with gold */}
              <motion.div
                 className="absolute w-3 h-3 bg-gradient-to-br from-white to-[#d4af37] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                 animate={{ scale: phase === 'hold' ? 1.5 : 1, opacity: phase === 'hold' ? 1 : 0.8 }}
                 transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
              />
          </div>

          {/* Text Instructions - positioned below the circle */}
          <div className="mt-12 flex flex-col items-center text-center space-y-3">
              <AnimatePresence mode="wait">
                  <motion.h2
                    key={phase}
                    initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl md:text-5xl font-serif-display font-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f4e5b2] to-[#d4af37]/60 tracking-[0.2em] uppercase"
                  >
                      {phase === 'inhale' ? t('breathing.inhale') : phase === 'hold' ? t('breathing.hold') : t('breathing.exhale')}
                  </motion.h2>
              </AnimatePresence>

              {/* Premium progress dots */}
              <div className="flex gap-2 mt-6">
                  {[...Array(TOTAL_CYCLES)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: i < cycleCount ? 1.1 : 1 }}
                        className={`w-2 h-2 rounded-full transition-all duration-700 ${i < cycleCount ? 'bg-gradient-to-br from-[#d4af37] to-[#f4e5b2] shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-white/10 border border-white/10'}`}
                      />
                  ))}
              </div>
          </div>
      </div>

      {/* Skip Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-12"
      >
          <button
            onClick={onSkip}
            className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/40 hover:text-[#d4af37]/80 transition-all duration-500 border-b border-transparent hover:border-[#d4af37]/30 pb-1 font-medium"
          >
              {t('breathing.skip')}
          </button>
      </motion.div>

    </motion.div>
  );
};

export default BreathingExercise;
