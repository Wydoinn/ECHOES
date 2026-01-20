
import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSound } from './SoundManager';

interface TiltCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  reducedMotion?: boolean;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, onClick, className = '', reducedMotion = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const { playHover } = useSound();

  // Motion values for 3D Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for the tilt
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 });
  
  // Magnetic pull effect
  const pullX = useSpring(useTransform(x, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 20 });
  const pullY = useSpring(useTransform(y, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 20 });

  const handleMouseEnter = () => {
    playHover();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate normalized position (-0.5 to 0.5)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();

    if (reducedMotion) return;

    // Ripple effect
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1000);
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={reducedMotion ? {} : {
        rotateX,
        rotateY,
        x: pullX,
        y: pullY,
        transformStyle: 'preserve-3d',
      }}
      initial={{ scale: 1, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={reducedMotion ? {} : { scale: 1.05, z: 50 }}
      whileTap={reducedMotion ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative group cursor-pointer perspective-1000 ${className}`}
    >
      {/* Floating Animation Wrapper */}
      <motion.div
        animate={reducedMotion ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full"
      >
        {/* Animated Gradient Border */}
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
        
        {/* Card Content - REMOVED backdrop-blur, used solid semi-transparent background */}
        <div className="relative h-full bg-[#150a25]/95 border border-white/10 rounded-xl p-8 overflow-hidden shadow-2xl transition-colors duration-300">
          
          {/* Inner Highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Content */}
          <div className={`relative z-10 transform-gpu transition-transform duration-300 ${!reducedMotion && 'group-hover:translate-z-10'}`}>
            {children}
          </div>

          {/* Ripples */}
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute rounded-full bg-white/20 pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 100,
                height: 100,
                x: '-50%',
                y: '-50%',
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;
