
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import TiltCard from '../components/TiltCard';
import { Category } from '../types';
import { sessionMemory } from '../utils/sessionMemory';
import { useSound } from '../components/SoundManager';

interface CategorySelectionProps {
  onSelect: (category: Category) => void;
  reducedMotion?: boolean;
}

const categories: Category[] = [
  { id: 'unsent', icon: '💔', title: 'Unsent Message', description: 'Words you never got to say.' },
  { id: 'grief', icon: '🕊️', title: 'Grief & Loss', description: 'Processing the space they left behind.' },
  { id: 'bonds', icon: '🔗', title: 'Broken Bonds', description: 'Relationships that faded or fractured.' },
  { id: 'regret', icon: '⚡', title: 'Regret & Guilt', description: 'Making peace with past choices.' },
  { id: 'forgive', icon: '🌱', title: 'Self-Forgiveness', description: 'Learning to be kind to yourself.' },
  { id: 'identity', icon: '🎭', title: 'Identity & Confusion', description: 'Finding yourself in the noise.' },
];

const CategorySelection: React.FC<CategorySelectionProps> = ({ onSelect, reducedMotion = false }) => {
  const insight = useMemo(() => sessionMemory.getInsight(), []);
  const { playSparkle } = useSound();

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 relative z-10">

      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20"
      >
        {/* Decorative top element */}
        <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="w-20 h-[1px] mx-auto mb-8 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
        />

        <h2 className="font-serif-display text-3xl md:text-5xl font-normal text-white mb-5 tracking-wide">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4e5b2] via-[#d4af37] to-[#f4e5b2]">Release</span>
        </h2>
        <p className="font-serif-body italic text-white/50 text-lg">Select the emotion closest to your heart</p>

        {/* Decorative bottom element */}
        <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.7 }}
            className="w-12 h-[1px] mx-auto mt-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {categories.map((cat, index) => {
          const isFamiliar = insight?.mostCommonCategoryId === cat.id;

          return (
            <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
            >
                <TiltCard
                    onClick={() => {
                        playSparkle();
                        onSelect(cat);
                    }}
                    className="h-full"
                    reducedMotion={reducedMotion}
                >
                <div className="flex flex-col items-center text-center space-y-5">
                    {/* Badge for returning user favorite */}
                    {isFamiliar && (
                        <div className="absolute top-4 right-4">
                            <span className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#f4e5b2]/80 text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full font-medium">
                                ✦ Familiar
                            </span>
                        </div>
                    )}

                    <div className="text-5xl md:text-6xl drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-500">
                    {cat.icon}
                    </div>

                    <h3 className="text-2xl font-serif-display font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f4e5b2] to-white/70 group-hover:from-[#f4e5b2] group-hover:via-[#d4af37] group-hover:to-[#f4e5b2] transition-all duration-500">
                    {cat.title}
                    </h3>

                    <p className="font-serif-body text-white/60 font-light leading-relaxed group-hover:text-white/80 transition-colors duration-500 italic">
                    {cat.description}
                    </p>
                </div>
                </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelection;
