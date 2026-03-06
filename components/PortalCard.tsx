import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface PortalCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  reducedMotion?: boolean;
}

const PortalCard: React.FC<PortalCardProps> = ({ children, onClick, className = '', reducedMotion = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isClicking, setIsClicking] = useState(false);

  // Magnetic Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring config for smooth magnetic pull
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Apply magnetic pull (dampened to keep it subtle, max ~10px)
    x.set(distanceX * 0.15);
    y.set(distanceY * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    if (!onClick) return;
    setIsClicking(true);

    // Cinematic transition: Flash -> Scale -> Fade Out
    setTimeout(() => {
        onClick();
    }, 600);
  };

  return (
    <div className="relative group perspective-1000 z-20 w-fit mx-auto">
      {/* 3. Premium Gold Halo Glow (Behind) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/40 via-purple-500/30 to-[#d4af37]/40 rounded-full blur-[50px] -z-10"
        animate={reducedMotion ? { opacity: 0.4 } : {
            opacity: [0.3, 0.6, 0.3],
            scale: [0.9, 1.15, 0.9]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={reducedMotion ? {} : { x: springX, y: springY }}
      />

      {/* 4. Magnetic Motion Container */}
      <motion.div
        ref={ref}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={reducedMotion ? {} : { x: springX, y: springY }}
        className={`relative cursor-pointer ${className}`}
      >
         {/* 1. Breathing Idle Animation */}
         <motion.div
            animate={isClicking || reducedMotion ? {} : { scale: [1, 1.02, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full"
         >
            {/* Main Button Body - Pill Shape */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isClicking
                    ? { scale: 1.15, opacity: 0 }
                    : { opacity: 1, scale: 1 }
                }
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden bg-gradient-to-b from-[#1a0b2e]/70 to-[#0d0617]/80 backdrop-blur-[24px] border border-[#d4af37]/20 rounded-full px-14 py-6 shadow-[0_0_40px_rgba(212,175,55,0.2),0_10px_40px_rgba(0,0,0,0.3)]"
            >
                {/* 2. Sweeping Light Reflection */}
                <motion.div
                    className="absolute top-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                    initial={{ left: '-100%' }}
                    animate={reducedMotion ? {} : { left: '200%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                />

                {/* 5. Cinematic Click Transition (Flash) - Optimized with no blend mode */}
                {isClicking && (
                    <motion.div
                        className="absolute inset-0 bg-white/20 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                {/* Inner Glow Border */}
                <div className="absolute inset-0 rounded-full border border-white/10 opacity-50 pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    {children}
                </div>
            </motion.div>
         </motion.div>
      </motion.div>
    </div>
  );
};

export default PortalCard;
