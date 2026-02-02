
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Aftercare } from '../types';
import TiltCard from './TiltCard';

interface AftercareKitProps {
  data: Aftercare;
  reducedMotion?: boolean;
}

const AftercareKit: React.FC<AftercareKitProps> = ({ data, reducedMotion = false }) => {
  // Show all practices
  const displayPractices = data.practices;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative z-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)]">
           <span className="text-2xl filter drop-shadow-lg">🌿</span>
        </div>
        <h2 className="font-serif-display text-3xl md:text-4xl text-white mb-6">
          Grounding & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-300">Care</span>
        </h2>
        <p className="text-white/60 leading-relaxed font-light">
          {data.summary}
        </p>
      </motion.div>

      {/* Practices Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full"
      >
        <AnimatePresence mode="popLayout">
            {displayPractices.map((practice, index) => (
                <motion.div
                    key={practice.title}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                    <TiltCard className="h-full" reducedMotion={reducedMotion}>
                        <div className="flex flex-col h-full items-start text-left p-2">
                            <div className="flex items-center justify-between w-full mb-4">
                                <span className="text-2xl">{practice.icon}</span>
                                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${
                                    practice.type === 'physical' ? 'border-violet-500/30 text-violet-200 bg-violet-900/20' :
                                    practice.type === 'reflective' ? 'border-purple-500/30 text-purple-200 bg-purple-900/20' :
                                    'border-fuchsia-500/30 text-fuchsia-200 bg-fuchsia-900/20'
                                }`}>
                                    {practice.type}
                                </span>
                            </div>

                            <h3 className="text-lg font-serif-display text-white/90 mb-2">
                                {practice.title}
                            </h3>

                            <p className="text-sm text-white/50 leading-relaxed">
                                {practice.description}
                            </p>
                        </div>
                    </TiltCard>
                </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="mt-16 text-[10px] uppercase tracking-widest text-purple-300/30"
      >
        These are gentle suggestions, not medical advice.
      </motion.p>

    </div>
  );
};

export default AftercareKit;
