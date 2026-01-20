
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
  }, [isInView, text, playType]);

  return (
    <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative z-10">
      
      <div className="max-w-4xl w-full flex flex-col items-center text-center">
        
        {/* Title Section */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 1 }}
           className="mb-14"
        >
            <h2 className="font-serif-display text-4xl md:text-5xl text-white/95 mb-4 tracking-tight">
                The <span className="text-purple-300 italic">Echo</span>
            </h2>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                Reflection
            </div>
        </motion.div>

        {/* Text Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
          animate={isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="relative bg-[#1a0b2e]/40 backdrop-blur-[50px] border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl min-h-[300px] flex items-center justify-center"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="font-serif-display text-xl md:text-2xl lg:text-3xl leading-[1.8] text-white/90 font-light relative">
            {displayedText}
            {isTyping && (
                <motion.span 
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-[3px] h-[1.2em] bg-purple-400 ml-1 align-middle"
                />
            )}
          </div>

        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={!isTyping && isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="mt-20"
        >
          <MagneticButton onClick={onOpenLetter} className="px-12 py-6 text-white tracking-widest uppercase text-xs md:text-sm border border-white/20 hover:bg-white/5 hover:border-white/40 transition-all">
            Open The Letter
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Reflection;
