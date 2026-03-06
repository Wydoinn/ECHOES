
import * as React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from '../components/MagneticButton';
import { useSound } from '../components/SoundManager';
import { useTranslation } from 'react-i18next';

interface LandingProps {
  onEnter: () => void;
  reducedMotion?: boolean;
  greeting?: string;
}

const Landing: React.FC<LandingProps> = ({ onEnter, reducedMotion = false, greeting = "What have you left unsaid?" }) => {
  const { t } = useTranslation();
  const brandName = t('app.name');
  const tagline = t('app.tagline');
  const { playWhoosh } = useSound();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.5,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      filter: 'blur(20px)',
      scale: 1.3,
      rotateX: 45
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
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

        {/* Premium Brand Mark */}
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="mb-6"
        >
            <div className="w-16 h-[1px] mx-auto bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
        </motion.div>

        {/* Title */}
        <motion.div
            className="flex space-x-3 md:space-x-5 mb-6 overflow-visible perspective-1000"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {brandName.split('').map((char, i) => (
                <motion.span
                    key={i}
                    variants={letterVariants}
                    whileHover={reducedMotion ? {} : {
                            y: -20,
                            scale: 1.08,
                            textShadow: "0 0 40px rgba(212, 175, 55, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)",
                            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                    }}
                    className="text-6xl sm:text-8xl md:text-[10rem] font-serif-display font-medium tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f4e5b2] to-[#d4af37]/40 drop-shadow-[0_0_60px_rgba(212,175,55,0.2)] cursor-default select-none"
                    style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
                >
                {char}
                </motion.span>
            ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.35em' }}
            transition={{ duration: 2, delay: 1.2 }}
            className="text-[10px] md:text-xs font-serif-display uppercase text-[#d4af37]/70 mb-12 tracking-[0.35em]"
        >
            {tagline}
        </motion.p>

        {/* Subtitle - Dynamic Greeting */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
        >
            <p className="text-sm md:text-lg font-serif-body italic text-white/60 font-light mb-16 max-w-md leading-relaxed">
                &quot;{greeting}&quot;
            </p>

            {/* Premium CTA Button */}
            <MagneticButton
                onClick={() => {
                    playWhoosh();
                    onEnter();
                }}
                className="px-8 py-3 border-[#d4af37]/20 hover:border-[#d4af37]/40 shadow-[0_0_40px_rgba(212,175,55,0.1)] hover:shadow-[0_0_60px_rgba(212,175,55,0.2)]"
                reducedMotion={reducedMotion}
            >
                <span className="text-sm font-serif-display text-[#f4e5b2] tracking-[0.25em] uppercase group-hover:text-white transition-colors duration-500">
                    {t('landing.enterButton')}
                </span>
            </MagneticButton>

            {/* Decorative bottom line */}
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 2.5, duration: 1.5 }}
                className="mt-20 w-24 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Landing;
