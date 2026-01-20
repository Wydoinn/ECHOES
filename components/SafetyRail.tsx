
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';

interface SafetyRailProps {
  onProceed: () => void;
  onCancel: () => void;
}

const SafetyRail: React.FC<SafetyRailProps> = ({ onProceed, onCancel }) => {
  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            onProceed();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, onProceed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0617]/60 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-[420px] w-full bg-[#1a0b2e]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Ambient Glow behind content */}
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-white/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col items-center">
            {/* Icon */}
            <div className="w-14 h-14 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner backdrop-blur-md">
                <span className="text-2xl">🌱</span>
            </div>

            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-white mb-4 tracking-wider uppercase">
              A Gentle Reminder
            </h2>

            <p className="text-white/60 font-light leading-relaxed mb-10 text-sm md:text-[15px]">
              ECHOES is a creative ritual for emotional release, not a substitute for professional therapy. If you are in crisis, please seek real-world support.
            </p>

            <div className="w-full flex flex-col gap-4 items-center">
                {/* Standard Magnetic Button */}
                <MagneticButton
                    onClick={onProceed}
                    className="w-full py-4 text-white hover:text-white bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                    shortcut="⌘+Enter"
                >
                    <span className="font-medium tracking-widest uppercase text-xs md:text-sm">
                        I Understand, Continue
                    </span>
                </MagneticButton>

                {/* Secondary Button */}
                <button
                    onClick={onCancel}
                    className="text-white/30 text-xs hover:text-white/60 transition-colors py-2 uppercase tracking-widest font-medium mt-2"
                >
                    Go Back (Esc)
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SafetyRail;
