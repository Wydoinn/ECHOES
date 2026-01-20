
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0617]/95 backdrop-blur-xl p-6"
    >
      <div className="max-w-md w-full text-center relative z-10">
        
        {/* Gentle Pulse Behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-900/20 blur-[80px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-[#1a0b2e] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col items-center">
            
            {/* Icon */}
            <div className="w-16 h-16 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-200">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
               </svg>
            </div>

            <h2 className="text-2xl font-serif-display text-white mb-4 tracking-wide">
              A Gentle Pause
            </h2>

            <p className="text-white/70 font-light leading-relaxed mb-8 text-sm md:text-base">
              It sounds like you are carrying something incredibly heavy right now. While ECHOES is here to help process emotions, it is not a substitute for professional crisis support.
              <br/><br/>
              If you are in pain or feel unsafe, please reach out to a human who can help. You matter.
            </p>

            <div className="w-full space-y-3">
              <MagneticButton 
                onClick={onSeekHelp}
                className="w-full py-4 bg-white/10 border-white/20 hover:bg-white/20"
              >
                <span className="text-sm font-medium tracking-widest uppercase">
                  I'll Seek Help Now
                </span>
              </MagneticButton>

              <button 
                onClick={onSeekHelp}
                className="w-full py-3 text-xs text-white/40 uppercase tracking-widest hover:text-white/70 transition-colors"
              >
                <a href="https://www.google.com/search?q=suicide+hotline" target="_blank" rel="noopener noreferrer">
                    Find Local Support
                </a>
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 w-full">
                 <button 
                    onClick={onBack}
                    className="text-white/30 text-xs hover:text-white/50 transition-colors"
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
