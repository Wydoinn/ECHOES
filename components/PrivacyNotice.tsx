import React from 'react';
import { motion } from 'framer-motion';

const PrivacyNotice: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      className="fixed bottom-4 left-6 z-40"
    >
      <div className="group relative">
        <div className="text-[10px] uppercase tracking-widest text-white/20 cursor-help hover:text-white/50 transition-colors">
          Privacy & Ethics
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a0b2e] border border-white/10 p-4 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <p className="text-xs text-white/70 font-light leading-relaxed">
                Your emotions are sacred. ECHOES does not store your data, track your behavior, or save your text. Everything is processed in real-time and released into the void.
            </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyNotice;