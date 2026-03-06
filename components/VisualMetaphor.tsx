
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VisualMetaphorProps {
  description?: string;
  pathData?: string;
  reducedMotion?: boolean;
  onShare?: () => void;
}

const VisualMetaphor: React.FC<VisualMetaphorProps> = ({ description = "", pathData, reducedMotion = false, onShare }) => {
  // Fallback path if none provided (Simple Infinity Loop)
  const safePath = pathData || "M 30 50 C 30 20 70 20 70 50 C 70 80 30 80 30 50 Z";

  const [displayedDesc, setDisplayedDesc] = useState("");

  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (!description) return undefined;

    let rafId: number;
    let startTime: number | null = null;
    const charsPerSecond = 60; // Elegant reveal speed
    const initialDelay = 1500; // Wait for SVG to draw partially

    const timeoutId = setTimeout(() => {
        const tick = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const chars = Math.min(description.length, Math.floor((elapsed / 1000) * charsPerSecond));
            setDisplayedDesc(description.slice(0, chars));

            if (chars >= description.length) {
                setDisplayedDesc(description);
                setTypingDone(true);
                return;
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
    }, initialDelay);

    return () => {
        clearTimeout(timeoutId);
        if (rafId) cancelAnimationFrame(rafId);
    };
  }, [description]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-10 pb-28 md:pb-36">

      {/* Background Ambience - Low opacity to show global particles */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0617]/0 via-[#1a0b2e]/40 to-[#0d0617]/0 z-0 pointer-events-none" />

      {/* Generative SVG Container */}
      <div className="relative z-10 w-full max-w-[420px] md:max-w-[480px] max-h-[38vh] aspect-square flex items-center justify-center p-6 flex-shrink">
        <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_0_25px_rgba(232,121,249,0.2)]"
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#e879f9" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Path Drawing Animation */}
            <motion.path
                d={safePath}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                    duration: reducedMotion ? 0 : 5,
                    ease: "easeInOut",
                    delay: 0.5
                }}
                style={{ willChange: 'stroke-dashoffset' }}
            />

            {/* Secondary Echo Path (delayed, lower opacity) */}
            {!reducedMotion && (
                 <motion.path
                    d={safePath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.5"
                    strokeOpacity="0.2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.2 }}
                    transition={{
                        duration: 7,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                    style={{
                        translateX: 0.5,
                        translateY: 0.5
                    }}
                />
            )}
        </svg>
      </div>

      {/* Editorial Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="relative z-20 max-w-2xl text-center px-6 mt-2 md:mt-4 flex-shrink-0"
      >
        <div className="w-[1px] h-6 bg-white/20 mx-auto mb-4" />
        <h3 className="font-serif-display text-2xl md:text-3xl lg:text-4xl text-white/95 leading-relaxed italic tracking-wide break-words">
          &quot;{displayedDesc}&quot;
          {!typingDone && (
              <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[2px] h-[1em] bg-purple-400 ml-1 align-middle"
              />
          )}
        </h3>
        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/50">
           Your Emotional Signature
        </p>

        {/* Share Button */}
        {onShare && (
             <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                onClick={onShare}
                className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400/40 transition-all group cursor-pointer pointer-events-auto shadow-[0_0_20px_rgba(139,92,246,0.1)]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300/70 group-hover:text-purple-200 transition-colors">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span className="text-[10px] uppercase tracking-widest text-purple-200/70 group-hover:text-purple-100 transition-colors">
                    Save Insight
                </span>
            </motion.button>
        )}
      </motion.div>

    </div>
  );
};

export default VisualMetaphor;
