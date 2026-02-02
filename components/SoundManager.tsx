
import * as React from 'react';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { SoundscapeParams } from '../types';

interface SoundContextType {
  playClick: () => void;
  playWhoosh: () => void;
  playChime: () => void;
  playType: () => void;
  playSparkle: () => void;
  playHover: () => void;
  playBreathPhase: (phase: 'inhale' | 'hold' | 'exhale', duration: number) => void;
  toggleMute: () => void;
  resumeContext: () => void;
  startSoundscape: (params: SoundscapeParams) => void;
  stopSoundscape: () => void;
  isMuted: boolean;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  return ctx;
};

interface SoundProviderProps {
  children: React.ReactNode;
  enabled: boolean;
}

// Helper: Note to Frequency
const getFreq = (note: string = "A4") => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Handle simple format like "C3" or "F#4"
  const regex = /^([A-G]#?)(\d)$/;
  const match = note.match(regex);

  if (!match || !match[1] || !match[2]) return 440; // Default

  const key = match[1];
  const octave = parseInt(match[2], 10);

  const keyIndex = notes.indexOf(key);
  if (keyIndex === -1) return 440;

  // A4 is index 9 in octave 4. Formula relative to A4 (440)
  // keyIndex for A is 9.
  // absolute semitone index = octave * 12 + keyIndex
  // A4 absolute = 4 * 12 + 9 = 57
  const semitoneOffset = (octave * 12 + keyIndex) - 57;

  return 440 * Math.pow(2, semitoneOffset / 12);
};

export const SoundProvider: React.FC<SoundProviderProps> = ({ children, enabled }) => {
  const [isMuted, setIsMuted] = useState(!enabled);
  const isMutedRef = useRef(isMuted);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Soundscape Refs
  const soundscapeNodesRef = useRef<AudioNode[]>([]);
  const soundscapeTimersRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const soundscapeGainRef = useRef<GainNode | null>(null);

  // Breathing Refs
  const breathOscRef = useRef<OscillatorNode | null>(null);
  const breathGainRef = useRef<GainNode | null>(null);

  // Sync ref
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!enabled) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- webkit prefix for Safari compatibility
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0.3; // Gentle master volume

    audioCtxRef.current = ctx;
    masterGainRef.current = gain;

    // Create White Noise Buffer for atmospheric whooshes & pads
    try {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noiseBufferRef.current = buffer;
    } catch (e) {
        console.error("Audio buffer error", e);
    }

    setIsMuted(false);

    return () => {
      stopSoundscape();
      if (ctx.state !== 'closed') ctx.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on enabled change
  }, [enabled]);

  const resumeContext = useCallback(() => {
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(e => console.error("Audio resume failed", e));
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (!isMutedRef.current) audioCtxRef.current?.suspend();
    else audioCtxRef.current?.resume();
  }, []);

  // --- SOUNDSCAPE SYNTHESIS ---

  const stopSoundscape = useCallback(() => {
    // Clear nodes
    soundscapeNodesRef.current.forEach(node => {
        try {
            node.disconnect();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- OscillatorNode check
            if ((node as any).stop) (node as any).stop();
        } catch {
          // Ignore errors during node cleanup
        }
    });
    soundscapeNodesRef.current = [];

    // Clear timers
    soundscapeTimersRef.current.forEach(clearTimeout);
    soundscapeTimersRef.current.forEach(clearInterval);
    soundscapeTimersRef.current = [];

    // Ramp down group gain if exists
    if (soundscapeGainRef.current && audioCtxRef.current) {
        try {
            const ctx = audioCtxRef.current;
            soundscapeGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
            soundscapeGainRef.current.gain.setValueAtTime(soundscapeGainRef.current.gain.value, ctx.currentTime);
            soundscapeGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
        } catch {
          // Ignore errors during gain ramp down
        }
        soundscapeGainRef.current = null;
    }
  }, []);

  const startSoundscape = useCallback((params: SoundscapeParams) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;

    stopSoundscape(); // Clean up existing

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // 1. Create Sub-Master Gain for Soundscape
    const scapeGain = ctx.createGain();
    scapeGain.gain.value = 0;
    scapeGain.connect(masterGainRef.current);

    // Fade In
    scapeGain.gain.setValueAtTime(0, ctx.currentTime);
    scapeGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 3);

    soundscapeGainRef.current = scapeGain;
    soundscapeNodesRef.current.push(scapeGain);

    // 2. Synthesize Elements
    params.elements.forEach((el) => {
        const volume = el.volume || 0.2;

        if (el.type === 'pad') {
            // PAD: Filtered Sawtooth/Triangle with slow LFO
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            const freq = getFreq(el.note);
            osc.frequency.value = freq;
            osc.type = 'triangle';

            // Detune slightly for thickness (chorus effect)
            osc.detune.value = (Math.random() - 0.5) * 15;

            filter.type = 'lowpass';
            filter.frequency.value = 400; // Warm

            // Simple LFO for filter movement
            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.1 + Math.random() * 0.1; // Slow breathing
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 200; // Modulation depth

            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(scapeGain);

            oscGain.gain.value = volume;

            osc.start();
            lfo.start();

            soundscapeNodesRef.current.push(osc, oscGain, filter, lfo, lfoGain);

        } else if (el.type === 'bell') {
            // BELL: FM Synthesis or High Sine with fast envelope
            const interval = (el.interval || 5) * 1000;
            const freq = getFreq(el.note);

            const playBell = () => {
                if (ctx.state === 'closed') return;
                const t = ctx.currentTime;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);

                // Add metallic overtone
                const overtone = ctx.createOscillator();
                overtone.type = 'sine';
                overtone.frequency.setValueAtTime(freq * 2.5, t);
                const overtoneGain = ctx.createGain();
                overtoneGain.gain.value = 0.1;

                // Envelope
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(volume, t + 0.05); // Attack
                gain.gain.exponentialRampToValueAtTime(0.001, t + 4); // Long Decay

                osc.connect(gain);
                overtone.connect(overtoneGain);
                overtoneGain.connect(gain);
                gain.connect(scapeGain);

                osc.start(t);
                overtone.start(t);
                osc.stop(t + 4.1);
                overtone.stop(t + 4.1);

                // Auto-cleanup wrapper nodes not needed as they stop themselves,
                // but we keep track of the interval
            };

            playBell(); // Initial hit
            const timer = setInterval(playBell, interval + Math.random() * 2000); // Randomize timing slightly
            soundscapeTimersRef.current.push(timer);

        } else if (el.type === 'noise') {
            // NOISE: Textured background
            if (!noiseBufferRef.current) return;

            const src = ctx.createBufferSource();
            src.buffer = noiseBufferRef.current;
            src.loop = true;

            const filter = ctx.createBiquadFilter();
            if (el.color === 'pink') {
                filter.type = 'lowshelf';
                filter.frequency.value = 500;
            } else {
                filter.type = 'lowpass';
                filter.frequency.value = 150; // Brown noise feel
            }

            const noiseGain = ctx.createGain();
            noiseGain.gain.value = volume * 0.5; // Soften noise

            src.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(scapeGain);

            src.start();
            soundscapeNodesRef.current.push(src, filter, noiseGain);
        }
    });

  }, [stopSoundscape]);

  // --- EXISTING SOUND EFFECTS ---

  const playClick = useCallback(() => {
    if (isMutedRef.current || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start(t);
    osc.stop(t + 0.1);
  }, []);

  const playHover = useCallback(() => {
    if (isMutedRef.current || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    // Don't try to play if context hasn't been started by a user gesture yet
    if (ctx.state === 'suspended') return;
    const t = ctx.currentTime;

    // Use noise buffer for airy hover if available
    if (noiseBufferRef.current) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBufferRef.current;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, t);
        filter.Q.value = 1;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.05); // Low volume
        gain.gain.linearRampToValueAtTime(0, t + 0.2);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(masterGainRef.current);

        src.start(t);
        src.stop(t + 0.25);
    } else {
        // Fallback oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(200, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.15);
        osc.connect(gain);
        gain.connect(masterGainRef.current);
        osc.start(t);
        osc.stop(t + 0.2);
    }
  }, []);

  const playWhoosh = useCallback(() => {
    if (isMutedRef.current || !audioCtxRef.current || !masterGainRef.current || !noiseBufferRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = noiseBufferRef.current;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 1.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.6);
    gain.gain.linearRampToValueAtTime(0, t + 1.5);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current);

    src.start(t);
    src.stop(t + 1.5);
  }, []);

  const playChime = useCallback(() => {
    if (isMutedRef.current || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t = ctx.currentTime;

    const freqs = [523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        const start = t + i * 0.06;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.08, start + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 3.5);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(start);
        osc.stop(start + 3.6);
    });
  }, []);

  const playType = useCallback(() => {
    if (isMutedRef.current || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = 1000 + Math.random() * 400;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq - 200, t + 0.1);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start(t);
    osc.stop(t + 0.1);
  }, []);

  const playSparkle = useCallback(() => {
    if (isMutedRef.current || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    for(let i=0; i<5; i++) {
        setTimeout(() => {
            if (!audioCtxRef.current || !masterGainRef.current) return;
            const ctxInner = audioCtxRef.current;
            const masterGain = masterGainRef.current;
            const t = ctxInner.currentTime;
            const osc = ctxInner.createOscillator();
            const gain = ctxInner.createGain();
            osc.frequency.setValueAtTime(2000 + Math.random() * 2000, t);

            gain.gain.setValueAtTime(0.03, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.15);
        }, i * 100);
    }
  }, []);

  // --- BREATHING EXERCISE TONES ---
  const playBreathPhase = useCallback((phase: 'inhale' | 'hold' | 'exhale', duration: number) => {
    if (isMutedRef.current || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    // Stop previous if any
    if (breathOscRef.current) {
        try { breathOscRef.current.stop(); breathOscRef.current.disconnect(); } catch {
          // Ignore errors during oscillator cleanup
        }
    }
    if (breathGainRef.current) {
        try { breathGainRef.current.disconnect(); } catch {
          // Ignore errors during gain cleanup
        }
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    gain.connect(masterGainRef.current);
    osc.connect(gain);

    const baseVol = 0.15; // Slightly louder than subtle

    if (phase === 'inhale') {
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(260, t + duration);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(baseVol, t + duration * 0.8);
    } else if (phase === 'hold') {
        osc.frequency.setValueAtTime(260, t);
        gain.gain.setValueAtTime(baseVol, t);
        gain.gain.linearRampToValueAtTime(baseVol * 0.8, t + duration);
    } else if (phase === 'exhale') {
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + duration);

        gain.gain.setValueAtTime(baseVol * 0.8, t);
        gain.gain.linearRampToValueAtTime(0, t + duration);
    }

    osc.start(t);
    osc.stop(t + duration + 0.1);

    breathOscRef.current = osc;
    breathGainRef.current = gain;
  }, []);

  return (
    <SoundContext.Provider value={{ playClick, playWhoosh, playChime, playType, playSparkle, playHover, playBreathPhase, toggleMute, resumeContext, startSoundscape, stopSoundscape, isMuted }}>
      {children}
    </SoundContext.Provider>
  );
};

const SoundManager: React.FC = () => {
  const { playClick, playType, resumeContext } = useSound();

  useEffect(() => {
    const unlock = () => {
        resumeContext();
    };

    const handleInteraction = () => {
        unlock();
        playClick();
    };

    const handleKey = () => {
        unlock();
        playType();
    };

    window.addEventListener('pointerdown', handleInteraction);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('touchstart', unlock, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('touchstart', unlock);
    };
  }, [playClick, playType, resumeContext]);

  return null;
};

export default SoundManager;
