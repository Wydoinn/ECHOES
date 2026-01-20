
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
      
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="text-3xl font-serif-display text-white mb-16 text-center"
      >
        Transformation <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Ritual</span>
      </motion.h2>

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
              className={`h-full border transition-all duration-500 ${completed[index] ? 'border-green-500/50 bg-green-900/10' : 'border-white/10'}`}
              onClick={() => toggleStep(index)}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs uppercase tracking-widest text-white/40">{step.title}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${completed[index] ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                      {completed[index] && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-lg text-white/90 font-light leading-relaxed transition-opacity ${completed[index] ? 'opacity-50 line-through' : 'opacity-100'}`}>
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 text-xs text-white/30 italic">
                  {completed[index] ? "Completed" : "Tap to complete"}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Completion Celebration Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={allDone ? { opacity: 1, scale: 1 } : {}}
        className="mt-16 text-center"
      >
        {allDone && (
          <div className="inline-block px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 font-serif-display">
               Ritual Complete
             </span>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default TransformationRitual;
