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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 1.2, 
        delay: delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={`relative group ${className}`}
    >
      {/* Animated Gradient Border */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-30 blur-sm group-hover:opacity-60 transition-all duration-700 animate-gradient-xy"></div>
      
      {/* Content Container - REMOVED backdrop-blur, increased opacity for performance */}
      <div className="relative bg-[#0d0617]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-12">
        
        {/* Inner Highlight (top lighting) */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;