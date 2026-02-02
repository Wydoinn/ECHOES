
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useSound } from './SoundManager';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  reducedMotion?: boolean;
  shortcut?: string;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ children, onClick, className = '', active = false, reducedMotion = false, shortcut }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const { playHover } = useSound();

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || reducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.4); // Strength of pull
    y.set(distanceY * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => playHover()}
      onClick={onClick}
      style={reducedMotion ? {} : { x: springX, y: springY }}
      className={`
        relative group cursor-pointer isolate
        flex items-center justify-center
        border rounded-full
        backdrop-blur-md overflow-hidden
        transition-colors duration-500 ease-out
        ${active ? 'bg-[#d4af37]/10 border-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.3)]' : 'bg-[rgba(255,255,255,0.05)] border-white/10 hover:border-[#d4af37]/30 hover:bg-[rgba(212,175,55,0.05)]'}
        ${className}
      `}
      data-hoverable="true"
    >
      {/* Premium Gold Glow Effect */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#d4af37]/20 via-purple-500/10 to-[#d4af37]/20 blur-xl transition-opacity duration-700 -z-10 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
        {children}
      </div>

       {/* Ripple Container */}
       {!reducedMotion && (
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-active:w-[200%] group-active:h-[200%] group-active:opacity-0" />
          </div>
        )}

        {/* Shortcut Hint Tooltip */}
        {shortcut && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
             <span className="bg-[#0d0617]/90 backdrop-blur text-white/60 text-[10px] px-2 py-1 rounded border border-white/10 font-mono tracking-widest">
                {shortcut}
             </span>
             {/* Tiny Triangle */}
             <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white/10 absolute left-1/2 -translate-x-1/2 top-full" />
          </div>
        )}
    </motion.button>
  );
};

export default MagneticButton;
