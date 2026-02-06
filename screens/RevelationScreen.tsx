
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TransformationResult, EmotionalData } from '../types';
import VisualMetaphor from '../components/VisualMetaphor';
import Reflection from '../components/Reflection';
import ClosureLetter from '../components/ClosureLetter';
import TransformationRitual from '../components/TransformationRitual';
import FinalRelease from '../components/FinalRelease';
import AftercareKit from '../components/AftercareKit';
import AudioEmotionMirror from '../components/AudioEmotionMirror';
import EmotionalArcGraph from '../components/EmotionalArcGraph';
import AmbientPlayer from '../components/AmbientPlayer';
import HomeButton from '../components/HomeButton';
import { generateShareCard } from '../utils/shareCardGenerator';

interface RevelationScreenProps {
  result: TransformationResult;
  originalData: EmotionalData;
  onRestart: () => void;
  reducedMotion?: boolean;
}

const RevelationScreen: React.FC<RevelationScreenProps> = ({ result, originalData, onRestart, reducedMotion = false }) => {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const ritualRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  const handleOpenLetter = () => {
    setIsLetterOpen(true);
  };

  const handleCloseLetter = () => {
    setIsLetterOpen(false);

    // Smooth scroll to insights if available, otherwise ritual
    setTimeout(() => {
        if (result.audioInsight || result.emotionalArc) {
             insightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
             ritualRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, 500);
  };

  const handleShare = async () => {
      await generateShareCard(result);
  };

  return (
    <div className="w-full bg-transparent text-white overflow-x-hidden font-sans">

      {/* Home Button */}
      <div className="fixed top-6 left-6 z-50">
        <HomeButton onClick={onRestart} />
      </div>

      {/* AI Ambient Sound Player */}
      <AmbientPlayer
         emotion={originalData.category.title}
         reflection={result.reflection}
      />

      {/* SECTION A: Visual Metaphor (Hero) */}
      <section className="relative h-screen z-0 flex flex-col justify-center">
         <VisualMetaphor
            description={result.visualMetaphor}
            pathData={result.visualMetaphorPath}
            reducedMotion={reducedMotion}
            onShare={handleShare}
         />

         {/* Scroll Indicator - Adjusted positioning */}
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-3 pointer-events-none z-10"
         >
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-light">Scroll to Reflect</span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/30 to-transparent" />
         </motion.div>
      </section>

      {/* SECTION B: Reflection & Insight (Centered Layout) */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center py-24 bg-gradient-to-b from-transparent via-[#12081f]/40 to-transparent space-y-24">
         <Reflection text={result.reflection} onOpenLetter={handleOpenLetter} />

         {/* SECTION C & C.5: Insights Wrapper */}
         {(result.audioInsight || result.emotionalArc) && (
            <div ref={insightsRef} className="w-full flex flex-col gap-24 scroll-mt-32">
                 {/* SECTION C: Audio Insight (Conditional) */}
                 {result.audioInsight && (
                    <div className="w-full">
                        <AudioEmotionMirror insight={result.audioInsight} reducedMotion={reducedMotion} />
                    </div>
                 )}

                 {/* SECTION C.5: Emotional Arc Graph */}
                 {result.emotionalArc && (
                     <div className="w-full px-6 flex justify-center">
                         <EmotionalArcGraph arc={result.emotionalArc} reducedMotion={reducedMotion} />
                     </div>
                 )}
            </div>
         )}
      </section>

      {/* MODAL: Closure Letter */}
      <ClosureLetter
        isOpen={isLetterOpen}
        onClose={handleCloseLetter}
        message={result.closureMessage}
      />

      {/* SECTION D: Transformation Ritual (Cards) */}
      <section ref={ritualRef} className="relative z-10 bg-gradient-to-b from-transparent via-[#150a25]/40 to-transparent py-24">
         <TransformationRitual steps={result.ritual} />
      </section>

      {/* SECTION E: Aftercare Kit */}
      {result.aftercare && (
        <section className="relative z-10 bg-gradient-to-b from-transparent via-[#0d1f1a]/40 to-transparent py-24">
            <AftercareKit data={result.aftercare} reducedMotion={reducedMotion} />
        </section>
      )}

      {/* SECTION F: Final Release */}
      <section className="relative min-h-screen z-20 bg-transparent flex items-center justify-center">
         <FinalRelease
            onRestart={onRestart}
            result={result}
            originalData={originalData}
            reducedMotion={reducedMotion}
         />
      </section>

    </div>
  );
};

export default RevelationScreen;
