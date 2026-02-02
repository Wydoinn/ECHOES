
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TiltCard from './TiltCard';
import { haptics } from '../utils/haptics';

interface TransformationRitualProps {
  steps: {
    step1: string;
    step2: string;
    step3: string;
  };
}

const TransformationRitual: React.FC<TransformationRitualProps> = ({ steps }) => {
  const [completed, setCompleted] = useState([false, false, false]);
  const [allDone, setAllDone] = useState(false);

  const toggleStep = (index: number) => {
    const newCompleted = [...completed];
    newCompleted[index] = !newCompleted[index];
    setCompleted(newCompleted);
    if (newCompleted[index]) {
        haptics.complete();
    }
  };

  useEffect(() => {
    if (completed.every(Boolean) && !allDone) {
      setAllDone(true);
      // Trigger simple visual burst here? Or rely on the UI glow.
    }
  }, [completed, allDone]);

  const stepList = [
    { title: "Physical Action", desc: steps.step1, delay: 0 },
    { title: "Symbolic Release", desc: steps.step2, delay: 0.2 },
    { title: "Forward Intention", desc: steps.step3, delay: 0.4 },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative z-10">

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        {/* Decorative top line */}
        <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-20 h-[1px] mx-auto mb-8 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
        />

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-serif-display text-white mb-4"
        >
          Transformation <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4e5b2] via-[#d4af37] to-[#f4e5b2]">Ritual</span>
        </motion.h2>

        <p className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]/40">Complete each step to seal your release</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {stepList.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: step.delay }}
            viewport={{ once: true }}
            className="h-full"
          >
            <TiltCard
              className={`h-full border transition-all duration-700 ${completed[index] ? 'border-[#d4af37]/50 shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'border-white/10'}`}
              onClick={() => toggleStep(index)}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/60 font-medium">{step.title}</span>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${completed[index] ? 'bg-gradient-to-br from-[#d4af37] to-[#f4e5b2] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-white/20'}`}>
                      {completed[index] && (
                        <motion.svg initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300 }} className="w-4 h-4 text-[#0d0617]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                  </div>

                  <p className={`text-lg font-serif-body text-white/90 font-light leading-relaxed transition-all duration-500 ${completed[index] ? 'opacity-40 line-through decoration-[#d4af37] decoration-2' : 'opacity-100'}`}>
                    {step.desc}
                  </p>
                </div>

                <div className={`mt-8 text-[10px] tracking-wider uppercase transition-colors duration-500 ${completed[index] ? 'text-[#d4af37]/60' : 'text-white/25'}`}>
                  {completed[index] ? "✓ Completed" : "Tap to complete"}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Premium Completion Celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={allDone ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-20 text-center"
      >
        {allDone && (
          <div className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-[#d4af37]/10 to-purple-500/10 backdrop-blur-md border border-[#d4af37]/30 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4e5b2] via-[#d4af37] to-[#f4e5b2] font-serif-display tracking-[0.2em] uppercase text-sm">
               ✦ Ritual Complete ✦
             </span>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default TransformationRitual;
