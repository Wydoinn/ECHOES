
import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';

interface CrisisSupportOverlayProps {
  onSeekHelp: () => void;
  onBack: () => void;
}

const CrisisSupportOverlay: React.FC<CrisisSupportOverlayProps> = ({ onSeekHelp, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
      aria-describedby="crisis-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0617]/95 backdrop-blur-xl p-6"
    >
      <div className="max-w-md w-full text-center relative z-10">

        {/* Gentle Pulse Behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-900/20 blur-[80px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-[#1a0b2e]/95 border border-purple-500/20 rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(139,92,246,0.15)] overflow-hidden"
        >
          <div className="flex flex-col items-center">

            {/* Icon */}
            <div className="w-16 h-16 mb-6 rounded-full bg-purple-500/10 border border-purple-400/20 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.15)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
               </svg>
            </div>

            <h2 id="crisis-title" className="text-2xl font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white mb-4 tracking-wide">
              A Gentle Pause
            </h2>

            <p id="crisis-desc" className="text-purple-100/70 font-light leading-relaxed mb-8 text-sm md:text-base">
              It sounds like you are carrying something incredibly heavy right now. While ECHOES is here to help process emotions, it is not a substitute for professional crisis support.
              <br/><br/>
              If you are in pain or feel unsafe, please reach out to a human who can help. You matter.
            </p>

            <div className="w-full space-y-3">
              <MagneticButton
                onClick={onSeekHelp}
                className="w-full py-4 bg-purple-500/15 border-purple-400/30 hover:bg-purple-500/25 hover:border-purple-400/50"
              >
                <span className="text-sm font-medium tracking-widest uppercase text-purple-100">
                  I&apos;ll Seek Help Now
                </span>
              </MagneticButton>

              <a
                href="https://988lifeline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 text-xs text-purple-300/50 uppercase tracking-widest hover:text-purple-200/80 transition-colors block text-center"
              >
                  Find Local Support (988 Lifeline)
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-purple-500/10 w-full">
                 <button
                    onClick={onBack}
                    className="text-purple-300/40 text-xs hover:text-purple-200/70 transition-colors"
                  >
                    Return to canvas
                  </button>
            </div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CrisisSupportOverlay;
