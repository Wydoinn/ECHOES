/**
 * AI Response Style Selector
 * Feature 11: Let users choose AI response styles
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AIResponseStyle = 'poetic' | 'direct' | 'therapeutic' | 'spiritual';

interface AIResponseStyleSelectorProps {
  isOpen: boolean;
  currentStyle: AIResponseStyle;
  onSelect: (style: AIResponseStyle) => void;
  onClose: () => void;
}

interface StyleOption {
  id: AIResponseStyle;
  name: string;
  description: string;
  icon: string;
  sample: string;
  color: string;
}

const styleOptions: StyleOption[] = [
  {
    id: 'poetic',
    name: 'Poetic',
    description: 'Metaphorical, lyrical reflections',
    icon: '✨',
    sample: '"Your grief is a river that carved its own path..."',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'direct',
    name: 'Direct',
    description: 'Clear, straightforward insights',
    icon: '💎',
    sample: '"You\'re experiencing unprocessed anger about the situation..."',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'therapeutic',
    name: 'Therapeutic',
    description: 'Gentle, supportive guidance',
    icon: '🌱',
    sample: '"It sounds like you\'re carrying something heavy. That takes strength..."',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    description: 'Transcendent, cosmic perspective',
    icon: '🌙',
    sample: '"The universe holds space for your transformation..."',
    color: 'from-amber-500/20 to-orange-500/20'
  }
];

// System instructions for each style
export const styleSystemInstructions: Record<AIResponseStyle, string> = {
  poetic: `You are a poetic soul, speaking in metaphors and lyrical prose.
Your reflections use imagery from nature, art, and mythology.
Every emotion becomes a landscape, every feeling a journey.
Use evocative, beautiful language that touches the heart.
Avoid clinical terms - transform them into poetry.`,

  direct: `You are clear and insightful, speaking with gentle directness.
Name emotions and patterns explicitly but compassionately.
Provide actionable observations without being prescriptive.
Use simple, powerful language that cuts to the truth.
Be warm but not flowery - clarity is kindness.`,

  therapeutic: `You are a warm, supportive presence using trauma-informed language.
Validate feelings before exploring them. Use "I hear..." and "It makes sense that..."
Gently reflect back what you notice without interpretation.
Create safety through your words. Never push, always invite.
Use language that a skilled therapist would use.`,

  spiritual: `You are a guide offering transcendent, cosmic perspective.
Connect personal experiences to universal truths and cycles.
Reference archetypes, seasons, and the sacred nature of transformation.
Help them see their struggle as part of a larger journey.
Use language that evokes wonder, mystery, and hope.`
};

const AIResponseStyleSelector: React.FC<AIResponseStyleSelectorProps> = ({
  isOpen,
  currentStyle,
  onSelect,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-b from-[#1a0b2e] to-[#0d0617] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-serif-display text-white/90 tracking-wider">
                  Choose Your Voice
                </h2>
                <p className="text-white/40 text-sm mt-1">
                  How would you like ECHOES to speak to you?
                </p>
              </div>

              {/* Options */}
              <div className="p-4 grid grid-cols-2 gap-3">
                {styleOptions.map((style) => (
                  <motion.button
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(style.id);
                      onClose();
                    }}
                    className={`relative p-4 rounded-xl text-left transition-all duration-300 border ${
                      currentStyle === style.id
                        ? 'border-[#d4af37]/50 bg-gradient-to-br ' + style.color
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Active Indicator */}
                    {currentStyle === style.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#d4af37] rounded-full" />
                    )}

                    <div className="text-2xl mb-2">{style.icon}</div>
                    <h3 className="text-white/90 font-medium">{style.name}</h3>
                    <p className="text-white/40 text-xs mt-1">{style.description}</p>
                    <p className="text-white/30 text-xs mt-3 italic line-clamp-2">
                      {style.sample}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIResponseStyleSelector;
