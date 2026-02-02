


import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AudioInsight } from '../types';

interface AudioEmotionMirrorProps {
  insight: AudioInsight;
  reducedMotion?: boolean;
}

const AudioEmotionMirror: React.FC<AudioEmotionMirrorProps> = ({ insight }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto px-6"
    >
      <div className="relative group overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-[0_20px_60px_rgba(139,92,246,0.1)]">

        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-900/30 via-fuchsia-900/30 to-transparent pointer-events-none" />

        {/* Header Badge */}
        <div className="flex justify-center mb-8">
             <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-400/20 px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-purple-200 text-xs tracking-widest uppercase font-medium">
                    {insight.suggestedLabel}
                </span>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
             {/* Divider Line (Mobile: Horizontal, Desktop: Vertical) */}
             <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />
             <div className="md:hidden w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

             {/* LEFT: Tone Analysis */}
             <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v4"/></svg>
                    </div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-purple-200/60">The Voice</h3>
                 </div>
                 <p className="text-white/80 font-serif leading-relaxed text-lg">
                    &ldquo;{insight.toneSummary}&rdquo;
                 </p>
             </div>

             {/* RIGHT: Word Analysis */}
             <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fuchsia-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="12" y2="14"/></svg>
                    </div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/60">The Words</h3>
                 </div>
                 <p className="text-white/80 font-serif leading-relaxed text-lg">
                    &ldquo;{insight.wordSummary}&rdquo;
                 </p>
             </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AudioEmotionMirror;
