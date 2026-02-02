
import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { useSound } from './SoundManager';

interface ReflectionProps {
  text: string;
  onOpenLetter: () => void;
}

const Reflection: React.FC<ReflectionProps> = ({ text, onOpenLetter }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { playType } = useSound();

  useEffect(() => {
    if (isInView && text) {
        setIsTyping(true);
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;

                // Play type sound randomly to feel organic (not machine gun)
                if (Math.random() > 0.5) {
                   playType();
                }
            } else {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 30); // Typing speed

        return () => clearInterval(interval);
    }
    return undefined;
  }, [isInView, text, playType]);

  return (
    <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative z-10">

      <div className="max-w-4xl w-full flex flex-col items-center text-center">

        {/* Premium Title Section */}
        <motion.div
           initial={{ opacity: 0, y: -30 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="mb-16"
        >
            {/* Decorative line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="w-16 h-[1px] mx-auto mb-8 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
            />

            <h2 className="font-serif-display text-4xl md:text-6xl text-white/95 mb-5 tracking-wide">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4e5b2] via-[#d4af37] to-[#f4e5b2] italic">Echo</span>
            </h2>
            <div className="text-[10px] uppercase tracking-[0.5em] text-[#d4af37]/50 font-medium">
                ◈ Reflection ◈
            </div>
        </motion.div>

        {/* Premium Text Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="relative bg-gradient-to-b from-[#1a0b2e]/50 to-[#0d0617]/60 backdrop-blur-[60px] border border-[#d4af37]/10 p-12 md:p-20 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.5)] min-h-[300px] flex items-center justify-center"
        >
          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-[#d4af37]/20 rounded-tl-sm"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-[#d4af37]/20 rounded-tr-sm"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-[#d4af37]/20 rounded-bl-sm"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-[#d4af37]/20 rounded-br-sm"></div>

          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#d4af37]/10 to-purple-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="font-serif-body text-xl md:text-2xl lg:text-3xl leading-[2] text-white/85 font-light relative italic">
            &quot;{displayedText}&quot;
            {isTyping && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    className="inline-block w-[2px] h-[1.1em] bg-gradient-to-b from-[#d4af37] to-purple-400 ml-1 align-middle rounded-full"
                />
            )}
          </div>

        </motion.div>

        {/* Premium Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={!isTyping && isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <MagneticButton onClick={onOpenLetter} className="px-14 py-7 text-[#f4e5b2] tracking-[0.25em] uppercase text-xs md:text-sm border border-[#d4af37]/30 hover:bg-[#d4af37]/5 hover:border-[#d4af37]/50 transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
            Open The Letter
          </MagneticButton>

          {/* Decorative bottom element */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={!isTyping && isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-10 text-[#d4af37]/30 text-lg"
          >
              ▼
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reflection;
