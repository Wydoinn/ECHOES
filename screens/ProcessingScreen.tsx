
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { EmotionalData, TransformationResult, SafetyAssessment, AIResponseStyle } from '../types';
import AlchemicalVortex, { RitualPhase } from '../components/AlchemicalVortex';
import MagneticButton from '../components/MagneticButton';
import CrisisSupportOverlay from '../components/CrisisSupportOverlay';
import { DEMO_RESULT } from '../utils/demoData';
import { useSound } from '../components/SoundManager';
import { haptics } from '../utils/haptics';
import { getTimeContext } from '../utils/timeAwareness';
import { sessionMemory } from '../utils/sessionMemory';
import { styleSystemInstructions } from '../components/AIResponseStyleSelector';
import { apiKeyManager } from '../utils/apiKeyManager';
import HomeButton from '../components/HomeButton';
import { withRetry } from '../utils/retry';
import { GEMINI_MODEL } from '../utils/constants';

interface ProcessingScreenProps {
  data: EmotionalData;
  onComplete: (result: TransformationResult) => void;
  onCancel: () => void;
  onRestart: () => void;
  isDemoMode: boolean;
  reducedMotion?: boolean;
  aiResponseStyle?: AIResponseStyle;
}

const steps = [
  "Deconstructing emotional resonance...",
  "Distilling raw memory...",
  "Weaving new metaphors...",
  "Transmuting sorrow into light..."
];

const waitingMessages = [
  "Consulting the stars...",
  "Tracing the constellations...",
  "Listening to the void...",
  "Gathering stardust...",
  "Harmonizing the echo..."
];

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ data, onComplete, onCancel, onRestart, isDemoMode, reducedMotion = false, aiResponseStyle = 'poetic' }) => {
  const [phase, setPhase] = useState<RitualPhase>('shatter');
  const [currentText, setCurrentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCrisisOverlay, setShowCrisisOverlay] = useState(false);

  // Refs for logic synchronization
  const apiResultRef = useRef<TransformationResult | null>(null);
  const isApiCompleteRef = useRef(false);
  const isUnsafeRef = useRef(false);

  const { playWhoosh, playSparkle, playChime } = useSound();

  // Helper to convert File/Blob to Base64
  const fileToPart = async (file: File | null, mimeType: string) => {
    if (!file) return null;
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1] ?? '';
        resolve({
          inlineData: {
            data: base64String,
            mimeType: mimeType
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Shortcut for Escape
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              onCancel();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // --- THE ALCHEMICAL RITUAL SEQUENCE ---
  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let waitingInterval: ReturnType<typeof setInterval>;

    // 1. SHATTER (0s) - Visuals only first
    if (!reducedMotion) playWhoosh();
    setPhase('shatter');

    // DELAY TEXT APPEARANCE (2.5s)
    timeoutIds.push(setTimeout(() => {
        // If safety check failed already, don't show text
        if (!isUnsafeRef.current) setCurrentText(steps[0] ?? '');
    }, 2500));

    // 2. VORTEX (4.5s)
    timeoutIds.push(setTimeout(() => {
        if (isUnsafeRef.current) return;
        setPhase('vortex');
        setCurrentText(steps[1] ?? '');
        if (!reducedMotion) playSparkle();
        haptics.heartbeat();
    }, 4500));

    // 3. CHECK API & COALESCE (Loop Check starting at 7.5s)
    const checkApiInterval = setInterval(() => {
        if (isUnsafeRef.current) {
            clearInterval(checkApiInterval);
            clearInterval(waitingInterval);
            return;
        }

        if (isApiCompleteRef.current) {
            clearInterval(checkApiInterval);
            clearInterval(waitingInterval);

            // Transition to Coalesce
            setPhase('coalesce');
            setCurrentText(steps[2] ?? '');
            if (!reducedMotion) playWhoosh();
            haptics.heartbeat();

            // 4. ORB (Coalesce + 3s)
            timeoutIds.push(setTimeout(() => {
                if (isUnsafeRef.current) return;
                setPhase('orb');
                setCurrentText(steps[3] ?? '');
                if (!reducedMotion) playChime();
                haptics.heartbeat();

                // 5. FINISH (Orb + 2.5s)
                timeoutIds.push(setTimeout(() => {
                    if (apiResultRef.current && !isUnsafeRef.current) {
                        onComplete(apiResultRef.current);
                    }
                }, 2500));

            }, 3000));
        }
    }, 1000);

    // Waiting Text Cycle (Starts after 8.5s if not done)
    timeoutIds.push(setTimeout(() => {
       if (!isApiCompleteRef.current && !isUnsafeRef.current) {
         let msgIndex = 0;
         waitingInterval = setInterval(() => {
            if (isUnsafeRef.current) {
                clearInterval(waitingInterval);
                return;
            }
            setCurrentText(waitingMessages[msgIndex % waitingMessages.length] ?? '');
            msgIndex++;
         }, 3500);
       }
    }, 8500));

    return () => {
        timeoutIds.forEach(clearTimeout);
        clearInterval(checkApiInterval);
        clearInterval(waitingInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // --- GEMINI PIPELINE (Safety -> Ritual) ---
  useEffect(() => {
    const runPipeline = async () => {
        if (isDemoMode) {
            setTimeout(() => {
                apiResultRef.current = DEMO_RESULT;
                isApiCompleteRef.current = true;
            }, 5000);
            return;
        }

        try {
            // Get API key from user's stored key
            const userApiKey = apiKeyManager.getApiKey();
            if (!userApiKey) {
              throw new Error("No API key configured. Please add your Gemini API key in settings.");
            }

            const ai = new GoogleGenAI({ apiKey: userApiKey });

            // --- CONSTRUCT PARTS ---
            type ContentPart = { text: string } | { inlineData: { data: string; mimeType: string } };
            const parts: ContentPart[] = [];

            // Include image analysis in the prompt context if available
            let imageContextString = "";
            if (data.imageAnalysis) {
                imageContextString = `
                IMAGE CONTEXT (User uploaded an image):
                - Visual Description: ${data.imageAnalysis.description}
                - Emotional Tone: ${data.imageAnalysis.emotionalTone}
                - Key Symbols: ${data.imageAnalysis.symbols.join(', ')}
                - Potential Meaning: ${data.imageAnalysis.possibleMeaning}

                IMPORTANT: Your reflection MUST acknowledge this image specifically. Reference the visual details provided above to show deep understanding.
                `;
            }

            let audioTranscriptionContext = "";
            if (data.transcription) {
                audioTranscriptionContext = `
                VOICE TRANSCRIPTION (What they said):
                "${data.transcription}"
                `;
            }

            // Session History Context
            const sessionInsight = sessionMemory.getInsight();
            let userHistoryContext = "";
            if (sessionInsight && sessionInsight.isReturning) {
                userHistoryContext = `
                RETURNING USER CONTEXT:
                - This is session #${sessionInsight.totalSessions + 1} for this user.
                - Last visit was ${sessionInsight.daysSinceLastVisit} days ago.
                - Last topic they explored: "${sessionInsight.lastCategoryTitle}".

                INSTRUCTION: Subtly acknowledge their return and continued courage in 1 sentence within the "reflection" (e.g., "Your return to this space honors the work you have already begun..."). Do not be repetitive or robotic about it.
                `;
            }

            parts.push({
              text: `
                SESSION CONTEXT:
                Emotional Category: "${data.category.title}" - ${data.category.description}
                ${userHistoryContext}

                PRIMARY USER REFLECTION (Written):
                "${data.text}"
                ${imageContextString}
                ${audioTranscriptionContext}
              `
            });

            let hasAudio = false;
            if (data.audio) {
              const audioPart = await fileToPart(data.audio, data.audio.type);
              if (audioPart) {
                parts.push(audioPart);
                hasAudio = true;
              }
            }
            if (data.drawing) {
               const base64String = data.drawing.split(',')[1] ?? '';
               parts.push({ inlineData: { data: base64String, mimeType: 'image/png' } });
            }
            if (data.image) {
              const imagePart = await fileToPart(data.image, data.image.type);
              if (imagePart) parts.push(imagePart);
            }
            if (data.document) {
               const docPart = await fileToPart(data.document, data.document.type);
               if (docPart) parts.push(docPart);
            }

            // --- STEP 1: SAFETY CHECK ---
            const safetyResponse = await withRetry(() => ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: { parts: parts },
                config: {
                    systemInstruction: `You are a safety triage system for an emotional release app called ECHOES.
Your ONLY job is to detect immediate risk of self-harm, suicide, or violence.
You are NOT a therapist. You do NOT provide clinical advice.

ANALYSIS PROTOCOL:
- Analyze the user's input (text, audio tone, image content, drawings).
- Detect signals of:
  1. Suicidal ideation or planning.
  2. Intent to harm self or others.
  3. Immediate medical emergency.

OUTPUT JSON ONLY:
{
  "riskLevel": "low" | "medium" | "high",
  "modelRationale": "Short explanation of why",
  "showCrisisOverlay": boolean // true if riskLevel is high
}

If the user is just expressing sadness, grief, regret, or normal emotional pain, riskLevel is "low" or "medium" and showCrisisOverlay is false.
Only set showCrisisOverlay to true for actionable, immediate crisis signals.`,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            riskLevel: { type: Type.STRING },
                            modelRationale: { type: Type.STRING },
                            showCrisisOverlay: { type: Type.BOOLEAN }
                        },
                        required: ["riskLevel", "showCrisisOverlay"]
                    }
                }
            }));

            let safetyResult: SafetyAssessment;
            try {
              safetyResult = JSON.parse(safetyResponse.text || "{}") as SafetyAssessment;
            } catch {
              // If safety check JSON is malformed, treat as low risk and continue
              safetyResult = { riskLevel: 'low', modelRationale: 'Safety check parse error', showCrisisOverlay: false };
            }

            if (safetyResult.showCrisisOverlay || safetyResult.riskLevel === 'high') {
                isUnsafeRef.current = true;
                setShowCrisisOverlay(true);
                return; // STOP EXECUTION - DO NOT RUN RITUAL
            }

            // --- STEP 2: RITUAL GENERATION (Only if safe) ---

            // Get Time Context for Ritual
            const timeContext = getTimeContext();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Complex schema object for Gemini API
            const properties: Record<string, any> = {
                reflection: { type: Type.STRING },
                closureMessage: { type: Type.STRING },
                visualMetaphor: { type: Type.STRING },
                visualMetaphorPath: { type: Type.STRING },
                ritual: {
                  type: Type.OBJECT,
                  properties: {
                      step1: { type: Type.STRING },
                      step2: { type: Type.STRING },
                      step3: { type: Type.STRING }
                  },
                  required: ["step1", "step2", "step3"]
                },
                emotionalArc: {
                  type: Type.OBJECT,
                  description: "Analyze the emotional journey in the text inputs. Break it into segments.",
                  properties: {
                    segments: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING, description: "A snippet/sentence from the user's text." },
                          sentiment: { type: Type.NUMBER, description: "Sentiment score from -1 (negative) to 1 (positive)" },
                          label: { type: Type.STRING, description: "Short 2-3 word emotional label" }
                        },
                        required: ["text", "sentiment", "label"]
                      }
                    },
                    overallArc: { type: Type.STRING },
                    narrativeSummary: { type: Type.STRING, description: "One sentence summary of the emotional journey." }
                  },
                  required: ["segments", "overallArc", "narrativeSummary"]
                },
                aftercare: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING },
                    practices: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          icon: { type: Type.STRING },
                          type: { type: Type.STRING, enum: ["physical", "reflective", "social"] }
                        },
                        required: ["title", "description", "icon", "type"]
                      }
                    }
                  },
                  required: ["summary", "practices"]
                }
            };

            const requiredFields = ["reflection", "closureMessage", "visualMetaphor", "visualMetaphorPath", "ritual", "emotionalArc", "aftercare"];

            // Instructions for Audio
            let audioInstruction = "";
            if (hasAudio) {
                audioInstruction = `
7. "audioInsight" (Object):
   - Listen to the user's vocal qualities (tone, pace, hesitation, tremor, silence) AND analyze the words they spoke (transcription provided in context).
   - "toneSummary": 2-3 sentences poetically describing HOW they spoke (e.g., "shaky but determined", "quiet exhaustion").
   - "wordSummary": 2-3 sentences analyzing WHAT they said (vocabulary choice, repeated phrases, underlying themes in the text).
   - "suggestedLabel": A 2-3 word poetic tag for their overall energy (e.g., "Trembling Courage", "Soft Resolve").
`;
                properties.audioInsight = {
                    type: Type.OBJECT,
                    properties: {
                        toneSummary: { type: Type.STRING },
                        wordSummary: { type: Type.STRING },
                        suggestedLabel: { type: Type.STRING }
                    },
                    required: ["toneSummary", "wordSummary", "suggestedLabel"]
                };
                requiredFields.push("audioInsight");
            }

            // STREAMING REQUEST
            const ritualStream = await withRetry(() => ai.models.generateContentStream({
              model: GEMINI_MODEL,
              contents: { parts: parts },
              config: {
                systemInstruction: `You are ECHOES, an advanced emotional intelligence engine designed to facilitate deep psychological release and closure. You are an expert therapist, poet, and abstract artist.

VOICE STYLE DIRECTIVE:
${styleSystemInstructions[aiResponseStyle]}

YOUR MISSION:
Synthesize ALL provided user inputs (text, voice, drawings, documents, images) into a single, cohesive emotional profile and generate a profound, healing response using your designated voice style.

TIME CONTEXT: The user is accessing ECHOES during ${timeContext.period} (${new Date().toLocaleTimeString()}).
Incorporate this into your response subtly:
- Reflection: Reference the time of day poetically ("${timeContext.greeting}")
- Ritual: Suggest time-appropriate actions (${timeContext.ritualSuggestion})

OUTPUT REQUIREMENTS (JSON):

1. "reflection" (100-150 words):
   - A mirror to their soul.
   - Explicitly acknowledge specific details from their inputs to show deep understanding.
   - Validate their feeling without cliché.
   - Style: Deep, poetic, empathetic.

2. "closureMessage" (150-200 words):
   - The specific words they need to hear to move forward.
   - Write it in the first person (from the perspective of the person/entity they are addressing) OR as a wise universal voice.

3. "visualMetaphor" (1 sentence):
   - A highly visual, abstract description of their emotional transformation.

4. "visualMetaphorPath" (SVG Path Data String):
   - A SINGLE, CONTINUOUS, ABSTRACT line drawing representing the metaphor.
   - It MUST be a valid SVG 'd' attribute string compatible with a 0 0 100 100 viewbox.
   - Style: Minimalist, fluid, organic.

5. "ritual" (Object with step1, step2, step3):
   - A psychomagic act to physically manifest the release.

6. "emotionalArc" (Object):
   - Break down the user's inputs (text/transcript) into key chronological segments.
   - Assign a sentiment score (-1 to 1) and label to each.
   - Describe the overall narrative arc.

7. "aftercare" (Object):
   - "summary": 1-2 gentle sentences validating that emotional release can be exhausting and suggesting they take it slow.
   - "practices": An Array of 3-4 simple, optional grounding techniques.
   - Each practice must have:
      - "title": Short name (e.g. "Box Breathing")
      - "description": 1 sentence on how/why.
      - "icon": A single emoji.
      - "type": One of "physical" (breathing/sensory), "reflective" (journaling/thinking), or "social" (calling a friend).
   - IMPORTANT: DO NOT give medical advice. Frame these as "gentle suggestions".
${audioInstruction}

Generate valid JSON only.`,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: properties,
                  required: requiredFields
                }
              }
            }));

            // Accumulate stream chunks
            let fullText = '';
            for await (const chunk of ritualStream) {
                fullText += chunk.text || '';
            }

            if (!fullText) throw new Error("No response from AI");

            let resultJson: TransformationResult;
            try {
              resultJson = JSON.parse(fullText) as TransformationResult;
            } catch {
              throw new Error("The AI returned an invalid response. Please try again.");
            }

            apiResultRef.current = resultJson;
            isApiCompleteRef.current = true;

        } catch (err: unknown) {
            console.error("Gemini Error:", err);

            // Provide more helpful error messages
            let errorMessage = "The stars are misaligned. We couldn't process your ritual right now.";

            const errorObj = err as { message?: string };
            if (errorObj.message?.includes('API key')) {
              errorMessage = "Please configure your Gemini API key in settings to continue.";
            } else if (errorObj.message?.includes('503') || errorObj.message?.includes('UNAVAILABLE') || errorObj.message?.includes('overloaded')) {
              errorMessage = "The AI model is currently overloaded. Please wait a moment and try again.";
            } else if (errorObj.message?.includes('429') || errorObj.message?.includes('quota') || errorObj.message?.includes('rate')) {
              errorMessage = "You've reached your API rate limit. Please wait a moment or upgrade your API plan.";
            } else if (errorObj.message?.includes('403') || errorObj.message?.includes('permission')) {
              errorMessage = "Your API key doesn't have permission for this model. Please check your API key.";
            } else if (errorObj.message?.includes('network') || errorObj.message?.includes('fetch')) {
              errorMessage = "Network error. Please check your connection and try again.";
            }

            setError(errorMessage);
        }
    };

    runPipeline();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
      setError(null);
      isApiCompleteRef.current = false;
      isUnsafeRef.current = false;
      apiResultRef.current = null;
      setPhase('shatter');
      setCurrentText('');
      setShowCrisisOverlay(false);
      // Go back to canvas to let user retry from there instead of full page reload
      onCancel();
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d0617]/80">

      {/* Home Button */}
      <div className="fixed top-6 left-6 z-50">
        <HomeButton onClick={onRestart} />
      </div>

      {/* Alchemical Canvas Engine - Hide if crisis overlay is active to reduce noise */}
      {!showCrisisOverlay && !reducedMotion && <AlchemicalVortex phase={phase} reducedMotion={reducedMotion} />}

      {/* Crisis Overlay */}
      <AnimatePresence>
          {showCrisisOverlay && (
              <CrisisSupportOverlay onSeekHelp={onRestart} onBack={onCancel} />
          )}
      </AnimatePresence>

      {/* Vignette Overlay for cinematic depth */}
      {!showCrisisOverlay && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0d0617_120%)] pointer-events-none z-10 opacity-60" />
      )}

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center max-w-3xl px-6 w-full text-center mt-[15vh]">

        {isDemoMode && !showCrisisOverlay && (
             <div className="absolute top-[-300px] text-[10px] uppercase tracking-[0.3em] text-pink-500/50 border border-pink-500/20 px-2 py-1 rounded">
               Demo Mode Active
             </div>
        )}

        {/* Status announcements for screen readers */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {currentText}
        </div>

        <AnimatePresence mode="wait">
             {currentText && !showCrisisOverlay && !error && (
                 <motion.div
                   key={currentText}
                   initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                   animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                   exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                   transition={{ duration: 0.8, ease: "easeOut" }}
                   className="flex flex-col items-center"
                 >
                    <div className="flex flex-col items-center space-y-4">
                      <h2
                        className="text-2xl md:text-3xl lg:text-4xl font-serif-display font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white/80"
                        style={{ textShadow: "0 0 30px rgba(139,92,246,0.3)" }}
                      >
                        {currentText}
                      </h2>
                    </div>
                 </motion.div>
             )}
        </AnimatePresence>

        {/* Error State */}
        <div role="alert" aria-live="assertive" aria-atomic="true">
          <AnimatePresence>
              {error && !showCrisisOverlay && (
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center gap-6 mt-8"
                  >
                      <div className="bg-red-900/10 border border-red-500/20 backdrop-blur-md px-6 py-4 rounded-lg text-red-200/80 text-sm max-w-md text-center">
                          {error}
                      </div>
                      <MagneticButton onClick={handleRetry} className="px-6 py-2 text-white/60 hover:text-white border-white/10" reducedMotion={reducedMotion}>
                          Try Again
                      </MagneticButton>
                  </motion.div>
              )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default ProcessingScreen;
