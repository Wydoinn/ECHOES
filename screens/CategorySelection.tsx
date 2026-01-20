
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
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-16"
      >
        <h2 className="font-serif-display text-3xl md:text-5xl font-light text-white mb-4 tracking-wide">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Release</span>
        </h2>
        <p className="text-white/60 font-light text-lg">Select the emotion closest to your heart</p>
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
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Badge for returning user favorite */}
                    {isFamiliar && (
                        <div className="absolute top-4 right-4">
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-200/70 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                                Familiar
                            </span>
                        </div>
                    )}

                    <div className="text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {cat.icon}
                    </div>
                    
                    <h3 className="text-2xl font-serif-display font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white/70 group-hover:from-pink-300 group-hover:to-purple-300 transition-all duration-300">
                    {cat.title}
                    </h3>
                    
                    <p className="text-white/50 font-light leading-relaxed group-hover:text-white/80 transition-colors duration-300">
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
