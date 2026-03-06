import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 1.4,
        delay: delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`relative group ${className}`}
    >
      {/* Premium Gold-Purple Gradient Border */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#d4af37]/40 via-purple-600/40 to-[#d4af37]/40 rounded-2xl opacity-40 blur-sm group-hover:opacity-70 transition-all duration-1000"></div>

      {/* Outer Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/5 via-purple-500/10 to-[#d4af37]/5 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-1000"></div>

      {/* Content Container */}
      <div className="relative bg-gradient-to-b from-[#0d0617]/95 to-[#150a25]/95 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden p-8 sm:p-12">

        {/* Premium Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>

        {/* Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l border-t border-[#d4af37]/20 rounded-tl-sm"></div>
        <div className="absolute top-3 right-3 w-6 h-6 border-r border-t border-[#d4af37]/20 rounded-tr-sm"></div>
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l border-b border-[#d4af37]/20 rounded-bl-sm"></div>
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r border-b border-[#d4af37]/20 rounded-br-sm"></div>

        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
