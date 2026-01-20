import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { useSound } from './SoundManager';
import { haptics } from '../utils/haptics';

interface BreathingExerciseProps {
  onComplete: () => void;
  onSkip: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete, onSkip }) => {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycleCount, setCycleCount] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  
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
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg aspect-square">
          
          {/* Main Breathing Circle */}
          <div className="relative flex items-center justify-center">
              {/* Outer Guide Ring */}
              <div className="absolute inset-[-40px] border border-white/5 rounded-full w-64 h-64 md:w-80 md:h-80" />
              
              {/* Expanding/Contracting Orb */}
              <motion.div
                animate={{
                    scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
                    opacity: phase === 'inhale' ? 0.8 : phase === 'hold' ? 0.8 : 0.3,
                    filter: phase === 'hold' ? 'blur(10px)' : 'blur(20px)'
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut"
                }}
                className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_50px_rgba(34,211,238,0.4)]"
              />
              
              {/* Inner Focus Dot */}
              <motion.div 
                 className="absolute w-2 h-2 bg-white rounded-full"
                 animate={{ scale: phase === 'hold' ? 1.5 : 1 }}
                 transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
              />
          </div>

          {/* Text Instructions */}
          <div className="absolute mt-80 flex flex-col items-center text-center space-y-2">
              <AnimatePresence mode="wait">
                  <motion.h2 
                    key={phase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-serif-display font-light text-white tracking-widest uppercase"
                  >
                      {phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}
                  </motion.h2>
              </AnimatePresence>
              
              <div className="flex gap-1 mt-4">
                  {[...Array(TOTAL_CYCLES)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${i < cycleCount ? 'bg-white' : 'bg-white/10'}`} 
                      />
                  ))}
              </div>
          </div>
      </div>

      {/* Skip Controls */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12"
      >
          <button 
            onClick={onSkip}
            className="text-xs uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors border-b border-transparent hover:border-white/20 pb-1"
          >
              Skip Breathing
          </button>
      </motion.div>

    </motion.div>
  );
};

export default BreathingExercise;