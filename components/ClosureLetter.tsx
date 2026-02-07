
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClosureLetterProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ClosureLetter: React.FC<ClosureLetterProps> = ({ isOpen, onClose, message }) => {
  const [stage, setStage] = useState<'closed' | 'opening' | 'reading'>('closed');
  const [visibleChars, setVisibleChars] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isSealCracked, setIsSealCracked] = useState(false);
  const hasBeenReadRef = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // If already read before, skip to fully visible state
      if (hasBeenReadRef.current) {
        setStage('reading');
        setVisibleChars(message.length);
        setShowButton(true);
        setIsSealCracked(true);
      } else {
        setStage('closed');
        setVisibleChars(0);
        setShowButton(false);
        setIsSealCracked(false);
      }
    }
  }, [isOpen, message.length]);

  // Handle Typing Effect when Reading starts (only if not already read)
  useEffect(() => {
    if (stage !== 'reading' || hasBeenReadRef.current) return undefined;

    let typingInterval: ReturnType<typeof setInterval> | null = null;

    const timer = setTimeout(() => {
        let i = 0;
        const chunkSize = 5; // Reveal 5 characters at a time for better performance
        typingInterval = setInterval(() => {
            if (i <= message.length) {
                setVisibleChars(i);
                i += chunkSize;
            } else {
                setVisibleChars(message.length);
                if (typingInterval) clearInterval(typingInterval);
                setShowButton(true);
                hasBeenReadRef.current = true; // Mark as read
            }
        }, 30);
    }, 1200); // Delay to allow paper to unfold

    return () => {
        clearTimeout(timer);
        if (typingInterval) clearInterval(typingInterval);
    };
  }, [stage, message]);

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!isOpen) return;
          if (e.key === 'Escape') {
              onClose();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Pre-process message into word chunks for better wrapping
  const messageChunks = useMemo(() => {
    const chunks = [];
    let currentIndex = 0;
    // Regex splits by whitespace sequences but captures them
    const regex = /([^\s]+|\s+)/g;
    let match;
    while ((match = regex.exec(message)) !== null) {
        chunks.push({
            text: match[0],
            isWhitespace: /^\s+$/.test(match[0]),
            startIndex: currentIndex
        });
        currentIndex += match[0].length;
    }
    return chunks;
  }, [message]);

  const handleOpenEnvelope = () => {
    // Crack the seal first
    setIsSealCracked(true);

    // Short delay for crack animation before opening
    setTimeout(() => {
        setStage('opening');
        // Transition to reading automatically after animation
        setTimeout(() => {
            setStage('reading');
        }, 1500);
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        >
            {/* Backdrop with Blur */}
            <div className="absolute inset-0 bg-[#05020a]/80 backdrop-blur-xl" onClick={stage === 'reading' ? onClose : undefined} />

            {/* Container - Grid for overlap - Increased max-width */}
            <div className="relative z-10 w-full max-w-4xl h-[80vh] grid place-items-center perspective-1000">

                {/* 1. ENVELOPE STAGE */}
                <AnimatePresence>
                    {(stage === 'closed' || stage === 'opening') && (
                        <motion.div
                            key="envelope"
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{
                                scale: stage === 'opening' ? 1.1 : 1,
                                y: stage === 'opening' ? 200 : 0,
                                opacity: stage === 'opening' ? 0 : 1
                            }}
                            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="col-start-1 row-start-1 relative w-[320px] h-[220px] md:w-[400px] md:h-[260px] cursor-pointer group"
                            onClick={handleOpenEnvelope}
                        >
                            {/* Envelope Shadow */}
                            <div className="absolute inset-0 bg-black/60 blur-3xl rounded-lg translate-y-12" />

                            {/* Envelope Body (Back) */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e] to-[#0d0617] rounded-lg border border-[#d4af37]/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex items-end justify-center">
                                {/* Premium Texture */}
                                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(212,175,55,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                {/* Gold inner glow */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/5 to-transparent" />
                            </div>

                            {/* The Letter Inside (Peek) */}
                            <motion.div
                                animate={{ y: stage === 'opening' ? -150 : 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="absolute left-4 right-4 top-2 bottom-2 bg-[#f4f1ea] rounded-sm shadow-md"
                            />

                            {/* Envelope Front Flaps (Left/Right/Bottom) */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Left Flap */}
                                <div
                                    className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#1a0b2e] z-10 border-r border-black/20"
                                    style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
                                />
                                {/* Right Flap */}
                                <div
                                    className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#1a0b2e] z-10 border-l border-black/20"
                                    style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
                                />
                                {/* Bottom Flap */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#1f0d38] z-20 shadow-lg border-t border-white/5"
                                    style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
                                />
                            </div>

                            {/* Top Flap (The one that opens) */}
                            <motion.div
                                initial={{ rotateX: 0 }}
                                animate={{ rotateX: stage === 'opening' ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                style={{ transformOrigin: 'top' }}
                                className="absolute top-0 left-0 right-0 h-1/2 z-30"
                            >
                                <div
                                    className="w-full h-full bg-[#23103f] shadow-xl border-b border-white/10"
                                    style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
                                />
                            </motion.div>

                            {/* Premium Wax Seal with Gold Accent */}
                            <motion.div
                                animate={stage === 'opening' ? { scale: 1.5, opacity: 0 } : { scale: 1, opacity: 1 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37] via-amber-600 to-[#8b6914] shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center border-2 border-[#f4e5b2]/40 group-hover:scale-105 transition-transform duration-500"
                            >
                                <div className="absolute inset-1 border border-[#f4e5b2]/20 rounded-full" />
                                <div className="absolute inset-0 rounded-full opacity-50" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                                <span className={`font-serif-display text-3xl text-[#0d0617]/80 pt-1 transition-all duration-300 ${isSealCracked ? 'scale-110 opacity-40 blur-[2px]' : ''}`}>
                                  E
                                </span>
                                {/* Crack Overlay */}
                                {isSealCracked && (
                                   <motion.svg
                                     viewBox="0 0 100 100"
                                     className="absolute inset-0 w-full h-full pointer-events-none"
                                     initial={{ pathLength: 0, opacity: 0.9 }}
                                     animate={{ pathLength: 1 }}
                                     transition={{ duration: 0.15 }}
                                   >
                                     <path d="M 30 20 L 50 50 L 20 80 M 50 50 L 80 40" stroke="rgba(13,6,23,0.7)" strokeWidth="4" fill="none" />
                                   </motion.svg>
                                )}
                            </motion.div>

                            <div className="absolute -bottom-14 left-0 right-0 text-center">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]/50 font-medium">Tap to Open</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. READING STAGE */}
                <AnimatePresence>
                    {stage === 'reading' && (
                        <motion.div
                            key="letter"
                            initial={{
                                opacity: 0,
                                scaleY: 0.1, // Start folded
                                scaleX: 0.9,
                                y: 50,
                                rotateX: 90
                            }}
                            animate={{
                                opacity: 1,
                                scaleY: 1, // Unfold
                                scaleX: 1,
                                y: 0,
                                rotateX: 0
                            }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                            transition={{
                                duration: 1.2,
                                ease: [0.2, 0.65, 0.3, 0.9], // Custom cubic bezier for paper feel
                            }}
                            className="col-start-1 row-start-1 relative w-full max-w-3xl rounded-sm shadow-2xl origin-top flex flex-col"
                            style={{
                                // Paper Texture & Gradient
                                background: 'linear-gradient(to bottom, #f4f1ea 0%, #e8e4db 100%)',
                                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.5)',
                                maxHeight: 'calc(85vh - 2rem)',
                            }}
                        >
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-40 pointer-events-none rounded-sm" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(44,24,16,0.03) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                            <div className="relative z-10 flex flex-col h-full p-8 md:p-12 overflow-hidden">
                                {/* Header - Fixed at top */}
                                <div className="text-center mb-6 flex-shrink-0">
                                    <div className="inline-block border-b border-[#2c1810]/20 pb-2">
                                        <span className="text-xs tracking-[0.4em] uppercase text-[#2c1810]/40 font-serif">The Message</span>
                                    </div>
                                </div>

                                {/* Scrollable Content Area */}
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                                    <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-[#2c1810] font-handwriting">
                                        {hasBeenReadRef.current ? (
                                            // Already read - render plain text without animations
                                            message
                                        ) : (
                                            // First time - animate each character
                                            messageChunks.map((chunk, i) => (
                                                <span key={i} className={chunk.isWhitespace ? "inline" : "inline-block whitespace-nowrap"}>
                                                    {chunk.text.split('').map((char, charOffset) => {
                                                        const globalIndex = chunk.startIndex + charOffset;
                                                        return (
                                                            <motion.span
                                                                key={charOffset}
                                                                initial={{ opacity: 0, filter: 'blur(4px)' }}
                                                                animate={globalIndex < visibleChars ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="inline-block"
                                                                style={{ minWidth: char === ' ' ? '0.3em' : 'auto' }}
                                                            >
                                                                {char}
                                                            </motion.span>
                                                        );
                                                    })}
                                                </span>
                                            ))
                                        )}
                                    </p>
                                </div>

                                {/* Footer - Fixed at bottom */}
                                <div className="mt-6 pt-4 border-t border-[#2c1810]/10 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
                                    <div className="text-left">
                                        <div className="text-xs text-[#2c1810]/40 italic font-serif">Sincerely,</div>
                                        <div className="text-lg text-[#2c1810]/70 font-serif-display mt-1 tracking-wider">ECHOES</div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {showButton && (
                                            <motion.div
                                                key="actions"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="flex items-center gap-3"
                                            >
                                                <button
                                                    onClick={onClose}
                                                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs uppercase tracking-widest hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg font-medium rounded-sm"
                                                >
                                                    Close Letter
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClosureLetter;
