import React from 'react';
import { motion } from 'framer-motion';

interface PrivacyNoticeProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      className="fixed bottom-4 left-6 z-40"
    >
      <div className="group relative">
        <div className="text-[10px] uppercase tracking-widest text-purple-300/30 cursor-help hover:text-purple-300/60 transition-colors">
          Privacy & Ethics
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#1a0b2e]/95 backdrop-blur-xl border border-purple-500/20 p-4 rounded-xl shadow-[0_10px_40px_rgba(139,92,246,0.15)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60"></div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-purple-300/60">Your Privacy</span>
            </div>
            <p className="text-xs text-purple-100/70 font-light leading-relaxed mb-3">
                Your emotions are sacred. ECHOES does not store your data on servers, track your behavior, or save your text. Everything is processed in real-time and released into the void.
            </p>

            {/* Legal Links */}
            <div className="flex gap-3 pt-2 border-t border-purple-500/10">
              <button
                onClick={onOpenPrivacy}
                className="text-[10px] text-purple-300/50 hover:text-purple-300/90 transition-colors underline underline-offset-2"
              >
                Privacy Policy
              </button>
              <button
                onClick={onOpenTerms}
                className="text-[10px] text-purple-300/50 hover:text-purple-300/90 transition-colors underline underline-offset-2"
              >
                Terms of Service
              </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyNotice;
