
import * as React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from '../components/MagneticButton';
import { useSound } from '../components/SoundManager';

interface LandingProps {
  onEnter: () => void;
  reducedMotion?: boolean;
  greeting?: string;
}

const Landing: React.FC<LandingProps> = ({ onEnter, reducedMotion = false, greeting = "What have you left unsaid?" }) => {
  const brandName = "ECHOES";
  const { playWhoosh } = useSound();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 80, 
      filter: 'blur(15px)',
      scale: 1.2 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 1.4,
        ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number], 
      },
    },
  };

  return (
    <motion.div 
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden"
      exit={{ 
        scale: 1.2, 
        opacity: 0, 
        filter: 'blur(30px)',
        transition: { 
          duration: 1.5, 
          ease: "easeInOut" 
        } 
      }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        
        {/* Title */}
        <motion.div 
            className="flex space-x-2 md:space-x-4 mb-16 overflow-visible"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {brandName.split('').map((char, i) => (
                <motion.span
                    key={i}
                    variants={letterVariants}
                    whileHover={reducedMotion ? {} : { 
                            y: -15, 
                            scale: 1.05,
                            textShadow: "0 0 25px rgba(255,255,255,0.4)",
                            transition: { duration: 0.3 }
                    }}
                    className="text-6xl sm:text-8xl md:text-9xl font-serif-display font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/20 drop-shadow-[0_0_35px_rgba(255,255,255,0.15)] cursor-default select-none"
                >
                {char}
                </motion.span>
            ))}
        </motion.div>

        {/* Subtitle - Now Dynamic Greeting */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
            className="flex flex-col items-center"
        >
            <p className="text-xs md:text-lg text-purple-200/50 font-light font-sans uppercase tracking-[0.25em] mb-20 max-w-lg">
                {greeting}
            </p>

            {/* Magnetic Button */}
            <MagneticButton 
                onClick={() => {
                    playWhoosh();
                    onEnter();
                }}
                className="px-12 py-5 border-white/10 hover:bg-white/5"
                reducedMotion={reducedMotion}
            >
                <div className="flex flex-col items-center space-y-1">
                    <span className="text-sm font-serif-display text-white tracking-[0.2em] uppercase group-hover:text-purple-100 transition-colors">
                        Enter the Void
                    </span>
                </div>
            </MagneticButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Landing;
