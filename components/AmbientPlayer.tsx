
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { useSound } from './SoundManager';
import { SoundscapeParams } from '../types';

interface AmbientPlayerProps {
  emotion: string;
  reflection: string;
}

const DEFAULT_SOUNDSCAPE: SoundscapeParams = {
  baseFrequency: 150,
  harmonic: "minor",
  tempo: 60,
  elements: [
    { type: "pad", note: "A3", volume: 0.15 },
    { type: "noise", color: "pink", volume: 0.03 },
    { type: "bell", note: "E5", interval: 12, volume: 0.1 }
  ],
  description: "A quiet resonance to hold your space."
};

const AmbientPlayer: React.FC<AmbientPlayerProps> = ({ emotion, reflection }) => {
  const { startSoundscape, stopSoundscape } = useSound();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [soundscapeData, setSoundscapeData] = useState<SoundscapeParams | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Auto-generate on mount
    generateSoundscape();

    // Cleanup on unmount
    return () => {
      stopSoundscape();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateSoundscape = async () => {
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const timeoutPromise = new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 8000)
        );

        const apiCall = ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{
                text: `Design an ambient soundscape for emotional healing.
                
                CONTEXT:
                - Emotional category: ${emotion}
                - Reflection theme: ${reflection.slice(0, 200)}...

                Generate parameters for a Web Audio API synthesizer.
                JSON Output Format:
                {
                  "baseFrequency": number (100-400),
                  "harmonic": "major" | "minor" | "suspended",
                  "tempo": number (40-80),
                  "elements": [
                    { "type": "pad", "note": "C3", "volume": 0.3 },
                    { "type": "bell", "interval": 8, "note": "G4", "volume": 0.1 },
                    { "type": "noise", "color": "pink", "volume": 0.05 }
                  ],
                  "description": "A very short poetic description of the sound (max 10 words)"
                }`
            }]},
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        baseFrequency: { type: Type.NUMBER },
                        harmonic: { type: Type.STRING },
                        tempo: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        elements: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    note: { type: Type.STRING },
                                    interval: { type: Type.NUMBER },
                                    color: { type: Type.STRING },
                                    volume: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Race API against timeout
        const response = await Promise.race([apiCall, timeoutPromise]);

        const data = JSON.parse(response.text || "{}") as SoundscapeParams;
        if (data && data.elements) {
            setSoundscapeData(data);
            startSoundscape(data);
            setIsPlaying(true);
        } else {
            throw new Error("Invalid format");
        }
    } catch (e) {
        console.warn("Soundscape generation skipped/failed, using fallback.", e);
        setSoundscapeData(DEFAULT_SOUNDSCAPE);
        startSoundscape(DEFAULT_SOUNDSCAPE);
        setIsPlaying(true);
    } finally {
        setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
        stopSoundscape();
        setIsPlaying(false);
    } else {
        if (soundscapeData) {
            startSoundscape(soundscapeData);
            setIsPlaying(true);
        } else {
            generateSoundscape();
        }
    }
  };

  return (
    <div 
        className="fixed top-6 left-6 z-50 flex flex-col items-start gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        <button 
            onClick={togglePlayback}
            className={`
                group relative flex items-center gap-3 pl-3 pr-4 py-2 rounded-full 
                border transition-all duration-500 backdrop-blur-md
                ${isPlaying 
                    ? 'bg-purple-900/30 border-purple-500/30 hover:border-purple-400/50' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
            `}
        >
            {/* Icon Visualizer */}
            <div className="relative w-6 h-6 flex items-center justify-center">
                {isGenerating ? (
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-t-transparent border-purple-300 rounded-full"
                    />
                ) : isPlaying ? (
                    <div className="flex gap-[2px] items-end h-3">
                        {[1, 2, 3, 4].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ height: [4, 12, 6, 10] }}
                                transition={{ 
                                    duration: 0.5 + Math.random() * 0.5, 
                                    repeat: Infinity, 
                                    repeatType: "reverse" 
                                }}
                                className="w-[2px] bg-purple-300 rounded-full"
                            />
                        ))}
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
                )}
            </div>

            <span className="text-xs uppercase tracking-widest text-white/70">
                {isGenerating ? "Harmonizing..." : isPlaying ? "Ambient" : "Muted"}
            </span>
        </button>

        {/* Description Tooltip */}
        <AnimatePresence>
            {(isHovered || isGenerating) && soundscapeData && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-[#1a0b2e]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 max-w-[200px] shadow-xl">
                        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Generated Soundscape</p>
                        <p className="text-xs text-purple-200 font-serif leading-relaxed italic">
                            "{soundscapeData.description}"
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default AmbientPlayer;
