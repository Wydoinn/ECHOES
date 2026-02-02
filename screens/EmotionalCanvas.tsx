
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { Category, EmotionalData, ImageAnalysis, AIResponseStyle } from '../types';
import MagneticButton from '../components/MagneticButton';
import DrawingModal from '../components/DrawingModal';
import TypingBackground, { TypingBackgroundHandle } from '../components/TypingBackground';
import VoiceVisualizer from '../components/VoiceVisualizer';
import SentimentIndicator from '../components/SentimentIndicator';
import GuidedJournaling from '../components/GuidedJournaling';
import { useSound } from '../components/SoundManager';
import { haptics } from '../utils/haptics';
import { draftManager, DraftData } from '../utils/draftManager';
import { apiKeyManager } from '../utils/apiKeyManager';

// ===========================================
// API TIER CONFIGURATION
// Set GEMINI_API_TIER in .env file ('free' or 'paid')
// ===========================================
const API_TIER = (process.env.GEMINI_API_TIER as 'free' | 'paid') || 'free';

const API_CONFIG = {
  free: {
    charThreshold: 40,      // Characters changed before regenerating prompts
    debounceMs: 8000,       // 8 seconds wait after typing stops
    minWordCount: 15,       // Minimum words before auto-prompts kick in
  },
  paid: {
    charThreshold: 25,      // More responsive
    debounceMs: 4000,       // 4 seconds - feels real-time
    minWordCount: 10,       // Earlier assistance
  }
};

const PROMPT_CONFIG = API_CONFIG[API_TIER];

// Icons (SVG)
const Icons = {
  Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  Mic: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
  MicOff: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/></svg>,
  File: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>,
  Pen: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  Sparkle: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>,
  CloseSmall: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  TextQuote: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
};

interface EmotionalCanvasProps {
  category: Category;
  onNext: (data: EmotionalData) => void;
  reducedMotion?: boolean;
  aiResponseStyle?: AIResponseStyle;
  sentimentIndicatorEnabled?: boolean;
  guidedJournalingEnabled?: boolean;
  initialDraft?: DraftData | null;
}

const EmotionalCanvas: React.FC<EmotionalCanvasProps> = ({
  category,
  onNext,
  reducedMotion = false,
  sentimentIndicatorEnabled = true,
  guidedJournalingEnabled = false,
  initialDraft = null
}) => {
  // State
  const [wordCount, setWordCount] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guided Journaling State - prompt setter used for guided journaling feature
  const [, setGuidedPrompt] = useState<string>('');

  // Draft resume notification
  const [showDraftResume, setShowDraftResume] = useState(false);
  const [resumableDraft, setResumableDraft] = useState<DraftData | null>(null);

  // Draft auto-save ref
  const draftSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentText = useRef<string>('');

  // Prompts State
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [arePromptsDismissed, setArePromptsDismissed] = useState(false);
  const lastAnalyzedText = useRef<string>("");

  // Media State
  const [image, setImage] = useState<File | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const [audio, setAudio] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [drawing, setDrawing] = useState<string | null>(null); // Base64

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // Using ref for audio chunks to avoid closure staleness issues
  const audioChunksRef = useRef<Blob[]>([]);

  // UI State
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const typingBackgroundRef = useRef<TypingBackgroundHandle>(null);
  const lastTypeTime = useRef<number>(0);

  const { playType, playClick, playSparkle } = useSound();

  // Focus editor on mount & check for existing draft
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Check for initial draft (from resume)
    if (initialDraft) {
      if (editorRef.current) {
        editorRef.current.innerText = initialDraft.text;
        setShowPlaceholder(false);
        setWordCount(initialDraft.text.trim().split(/\s+/).filter(w => w.length > 0).length);
        currentText.current = initialDraft.text;
      }
      if (initialDraft.drawing) {
        setDrawing(initialDraft.drawing);
      }
      if (initialDraft.transcription) {
        setTranscription(initialDraft.transcription);
      }
    } else {
      // Check for existing draft for this category
      const existingDraft = draftManager.getDraftForCategory(category.id);
      if (existingDraft && existingDraft.text.trim().length > 0) {
        setResumableDraft(existingDraft);
        setShowDraftResume(true);
      }
    }

    return () => {
        if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
        if (promptsTimeoutRef.current) clearTimeout(promptsTimeoutRef.current);
        if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount
  }, []);

  // Auto-save draft on text change
  const saveDraft = useCallback(() => {
    const text = editorRef.current?.innerText || '';
    if (text.trim().length > 10) {
      draftManager.saveDraft({
        categoryId: category.id,
        categoryTitle: category.title,
        text,
        drawing,
        transcription
      });
    }
  }, [category.id, category.title, drawing, transcription]);

  // Handle resuming draft
  const handleResumeDraft = () => {
    if (resumableDraft && editorRef.current) {
      editorRef.current.innerText = resumableDraft.text;
      setShowPlaceholder(false);
      setWordCount(resumableDraft.text.trim().split(/\s+/).filter(w => w.length > 0).length);
      currentText.current = resumableDraft.text;
      if (resumableDraft.drawing) {
        setDrawing(resumableDraft.drawing);
      }
      if (resumableDraft.transcription) {
        setTranscription(resumableDraft.transcription);
      }
    }
    setShowDraftResume(false);
  };

  const handleDiscardDraft = () => {
    draftManager.clearCurrentDraft();
    setShowDraftResume(false);
  };

  // PROMPT GENERATION LOGIC
  const generatePrompts = async (force: boolean = false) => {
    if (arePromptsDismissed && !force) return;

    const currentText = editorRef.current?.innerText || "";

    // Logic to avoid spamming API if text hasn't changed enough
    // Uses config threshold based on API tier
    if (!force && wordCount > 0 && Math.abs(currentText.length - lastAnalyzedText.current.length) < PROMPT_CONFIG.charThreshold) {
        return;
    }

    setIsLoadingPrompts(true);
    try {
        const userApiKey = apiKeyManager.getApiKey();
        if (!userApiKey) {
          setIsLoadingPrompts(false);
          return;
        }
        const ai = new GoogleGenAI({ apiKey: userApiKey });
        const isInitial = currentText.trim().length === 0;

        let promptText = "";
        if (isInitial) {
             promptText = `CONTEXT: User selected category "${category.title}" (${category.description}). They haven't written anything yet. Generate 3 short, thought-provoking opening questions to help them begin.`;
        } else {
             promptText = `CONTEXT: User selected category "${category.title}". USER TEXT: "${currentText.slice(0, 1500)}...". Generate 3 gentle follow-up questions to deepen their reflection.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: promptText }] },
            config: {
                systemInstruction: `You are a gentle, creative journaling companion for ECHOES.
Your task is to generate 3 short, open-ended questions (under 15 words each).
- Tone: Empathetic, poetic, non-judgmental.
- Do NOT give advice. Do NOT be diagnostic.
- Focus on sensory details, emotions, and "unsaid" things.
Output JSON: { "questions": ["...", "...", "..."] }`,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const result = JSON.parse(response.text || "{}");
        if (result.questions && Array.isArray(result.questions)) {
            setPrompts(result.questions.slice(0, 3));
            lastAnalyzedText.current = currentText;
            setArePromptsDismissed(false);
        }
    } catch (err) {
        console.error("Prompts failed", err);
    } finally {
        setIsLoadingPrompts(false);
    }
  };

  // Initial Load of Prompts
  useEffect(() => {
    const t = setTimeout(() => {
        generatePrompts(true);
    }, 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on category change
  }, [category.id]);

  // Ongoing Prompts Logic (Debounced) - Uses API tier config
  useEffect(() => {
    if (wordCount < PROMPT_CONFIG.minWordCount) return;

    if (promptsTimeoutRef.current) clearTimeout(promptsTimeoutRef.current);
    promptsTimeoutRef.current = setTimeout(() => {
        generatePrompts(false);
    }, PROMPT_CONFIG.debounceMs);

    return () => {
        if (promptsTimeoutRef.current) clearTimeout(promptsTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Debounced prompt generation
  }, [wordCount, category]);

  const insertPrompt = (prompt: string) => {
    if (editorRef.current) {
        playClick();
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

        const textNode = document.createTextNode(`\n\n${prompt}\n`);

        if (range && editorRef.current.contains(range.commonAncestorContainer)) {
            range.collapse(false);
            range.insertNode(textNode);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        } else {
            editorRef.current.appendChild(textNode);
            const newRange = document.createRange();
            newRange.selectNodeContents(editorRef.current);
            newRange.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
        }
        editorRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        setPrompts([]);
    }
  };

  const dismissPrompts = () => {
      setPrompts([]);
      setArePromptsDismissed(true);
  };

  // Deep Image Analysis
  const analyzeImage = async (file: File) => {
    setIsAnalyzingImage(true);
    setImageAnalysis(null);
    try {
        const userApiKey = apiKeyManager.getApiKey();
        if (!userApiKey) {
          throw new Error('No API key configured');
        }
        const ai = new GoogleGenAI({ apiKey: userApiKey });

        // Convert to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1] ?? '');
            };
            reader.onerror = error => reject(error);
        });

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: file.type, data: base64Data } },
                    { text: `Analyze this image for emotional healing context:
        1. Describe the main subject/scene in 1 sentence
        2. Identify the dominant emotional tone (e.g., "nostalgic warmth", "quiet grief")
        3. Note 2-3 symbolic elements that could represent emotions
        4. Suggest what this image might mean to someone processing loss/regret
        Output JSON: { "description": "", "emotionalTone": "", "symbols": [], "possibleMeaning": "" }` }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        emotionalTone: { type: Type.STRING },
                        symbols: { type: Type.ARRAY, items: { type: Type.STRING } },
                        possibleMeaning: { type: Type.STRING }
                    }
                }
            }
        });

        const result = JSON.parse(response.text || "{}");
        setImageAnalysis(result);
        playSparkle(); // Audio feedback when analysis is done
    } catch (e) {
        console.error("Image analysis failed", e);
    } finally {
        setIsAnalyzingImage(false);
    }
  };

  // Transcribe Audio
  const transcribeAudio = async (audioFile: File) => {
    setIsTranscribing(true);
    setTranscription(null);
    try {
        const userApiKey = apiKeyManager.getApiKey();
        if (!userApiKey) {
          throw new Error('No API key configured');
        }
        const ai = new GoogleGenAI({ apiKey: userApiKey });

        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(audioFile);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1] ?? '');
            };
            reader.onerror = error => reject(error);
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [
             { inlineData: { mimeType: audioFile.type || 'audio/mp3', data: base64Data } },
             { text: "Transcribe this audio recording word-for-word. Output only the raw transcription text, nothing else." }
          ]}
        });

        const text = response.text;
        if (text) {
          setTranscription(text.trim());
          playSparkle();
        }
    } catch (err) {
        console.error("Transcription failed", err);
    } finally {
        setIsTranscribing(false);
    }
  };

  // Handle Text Input & Typing Effects
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText;
    currentText.current = content;
    playType();
    haptics.type();
    const isEmpty = content.trim().length === 0;
    if (showPlaceholder !== isEmpty) {
        setShowPlaceholder(isEmpty);
    }
    setIsAutoSaving(true);
    const now = Date.now();
    const timeDiff = now - lastTypeTime.current;
    lastTypeTime.current = now;
    const intensity = Math.min(1, 100 / Math.max(timeDiff, 50));
    if (typingBackgroundRef.current && !reducedMotion) {
        typingBackgroundRef.current.addRipple(intensity);
    }
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
        const count = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        setWordCount(count);
        setIsAutoSaving(false);
    }, 600);

    // Auto-save draft (debounced)
    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
    draftSaveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 2000);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Recording Handlers
  const startRecording = async () => {
    try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
            }
        };
        recorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Microphone access denied:", err);
        setError("Microphone access is required to record voice notes.");
        setTimeout(() => setError(null), 5000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
            const file = new File([audioBlob], "voice-note.mp3", { type: 'audio/mp3' });
            setAudio(file);
            transcribeAudio(file); // Trigger transcription
            setAudioStream(null);
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
        };
        setIsRecording(false);
    }
  };

  const toggleRecording = useCallback(() => {
      if (isRecording) stopRecording();
      else startRecording();
  }, [isRecording]); // eslint-disable-line react-hooks/exhaustive-deps

  // Media Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio' | 'document') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'image') {
          setImage(file);
          analyzeImage(file); // Trigger deep analysis
      }
      if (type === 'audio') {
          setAudio(file);
          transcribeAudio(file);
      }
      if (type === 'document') setDocumentFile(file);
    }
  };

  const removeMedia = (type: 'image' | 'audio' | 'document' | 'drawing') => {
    if (type === 'image') {
        setImage(null);
        setImageAnalysis(null);
    }
    if (type === 'audio') {
        setAudio(null);
        setTranscription(null);
    }
    if (type === 'document') setDocumentFile(null);
    if (type === 'drawing') setDrawing(null);
  };

  const handleNext = useCallback(() => {
    const currentText = editorRef.current?.innerText || "";
    onNext({
      category,
      text: currentText,
      image,
      imageAnalysis,
      audio,
      transcription,
      document: documentFile,
      drawing
    });
  }, [category, image, imageAnalysis, audio, transcription, documentFile, drawing, onNext]);

  const handleAreaClick = (e: React.MouseEvent) => {
    if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        editorRef.current.focus();
        if (editorRef.current.innerText.length > 0) {
            const range = document.createRange();
            const sel = window.getSelection();
            if (sel) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isDrawingModalOpen) return; // Let modal handle its own keys

        const isCmd = e.metaKey || e.ctrlKey;

        // Cmd+Enter: Submit
        if (isCmd && e.key === 'Enter') {
            if (wordCount > 0 || image || drawing || audio || documentFile) {
                handleNext();
            }
        }
        // Cmd+R: Toggle Record
        if (isCmd && e.key === 'r') {
            e.preventDefault();
            toggleRecording();
        }
        // Cmd+D: Open Drawing
        if (isCmd && e.key === 'd') {
            e.preventDefault();
            setIsDrawingModalOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wordCount, image, drawing, audio, documentFile, isDrawingModalOpen, handleNext, toggleRecording]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-screen flex flex-col items-center overflow-hidden"
    >
      {/* Background Overlay & Effects */}
      <div className="absolute inset-0 bg-[#0d0617]/40 -z-10" />
      <TypingBackground ref={typingBackgroundRef} />

      {/* Draft Resume Notification */}
      <AnimatePresence>
        {showDraftResume && resumableDraft && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-md"
          >
            <div className="mx-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-green-400 text-xs mb-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                UNFINISHED DRAFT FOUND
              </div>
              <p className="text-white/70 text-sm line-clamp-2 mb-3">
                &quot;{resumableDraft.text.slice(0, 100)}{resumableDraft.text.length > 100 ? '...' : ''}&quot;
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResumeDraft}
                  className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 text-sm transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={handleDiscardDraft}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 text-sm transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Visualizer Overlay */}
      <AnimatePresence>
        {isRecording && audioStream && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-[#0d0617]/70 backdrop-blur-sm"
             >
                <VoiceVisualizer stream={audioStream} />
                <div className="absolute bottom-32 text-white/70 animate-pulse tracking-widest">LISTENING TO YOUR ECHO...</div>
                <MagneticButton onClick={stopRecording} className="absolute bottom-16 px-8 py-3 bg-red-500/20 border-red-500 text-red-200">
                    Stop Recording
                </MagneticButton>
             </motion.div>
        )}
      </AnimatePresence>

      {/* Top Status */}
      <div className="w-full max-w-4xl flex-none flex justify-between items-center text-white/70 text-sm font-light tracking-widest uppercase py-6 px-6 relative z-20">
        <div className="flex items-center gap-2">
            <span>{category.icon}</span>
            <span>{category.title}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Sentiment Indicator - Feature 11 */}
          <SentimentIndicator
            text={currentText.current}
            isEnabled={sentimentIndicatorEnabled}
            reducedMotion={reducedMotion}
          />
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-purple-400 transition-opacity duration-500 ${isAutoSaving ? 'opacity-100' : 'opacity-0'}`} />
            <span>{isAutoSaving ? 'Saving...' : 'Saved'}</span>
          </div>
        </div>
      </div>

      {/* Guided Journaling Panel */}
      <GuidedJournaling
        isEnabled={guidedJournalingEnabled}
        category={category}
        onPromptChange={setGuidedPrompt}
        currentWordCount={wordCount}
      />

      {/* Main Canvas Area - Glass Card */}
      <div className="flex-1 w-full max-w-3xl relative z-10 min-h-0 px-6 py-2 flex flex-col justify-center">
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-[55vh] relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group flex flex-col"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
        >
             {/* Inner Highlight */}
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div
                className="flex-1 w-full overflow-y-auto no-scrollbar relative cursor-text p-8 md:p-12"
                onClick={handleAreaClick}
            >
                <div className="min-h-full flex flex-col">
                    {/* Placeholder */}
                    <AnimatePresence>
                    {showPlaceholder && (
                        <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-full"
                        >
                        <h2 className="text-3xl md:text-4xl font-serif-display text-white/30 font-medium italic drop-shadow-lg">
                            Pour your heart out...
                        </h2>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    {/* The Editor */}
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onPaste={handlePaste}
                        suppressContentEditableWarning
                        className="w-full outline-none text-xl md:text-2xl font-light leading-[1.8] tracking-wide text-white/90 caret-pink-500 selection:bg-pink-500/30 selection:text-white empty:before:content-[''] relative z-10"
                        style={{ minHeight: '100%' }}
                    />
                </div>
            </div>

            {/* Word Count */}
            <div className="absolute bottom-4 right-6 pointer-events-none z-20" aria-live="polite" aria-atomic="true">
                <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${wordCount > 0 ? 'bg-pink-500' : 'bg-white/20'}`} />
                    <span className="text-white/60 text-xs font-mono">
                        {wordCount} words
                    </span>
                </div>
            </div>
        </motion.div>
      </div>

      {/* Guided Prompts Strip */}
      <div className="w-full max-w-3xl px-6 min-h-[48px] z-20 flex items-center justify-center my-2 gap-3">
         <AnimatePresence mode="wait">
            {isLoadingPrompts ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-purple-200/50 flex items-center gap-2 py-2"
                >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <Icons.Sparkle />
                    </motion.div>
                    <span className="tracking-widest uppercase">Listening...</span>
                </motion.div>
            ) : prompts.length > 0 ? (
                <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                >
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {prompts.map((p, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => insertPrompt(p)}
                                className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-100/80 text-xs md:text-sm px-4 py-2 rounded-full backdrop-blur-sm transition-all text-left max-w-full truncate"
                            >
                                {p}
                            </motion.button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                        <button onClick={() => generatePrompts(true)} className="p-2 text-white/30 hover:text-white/80 transition-colors rounded-full hover:bg-white/5" title="Refresh Ideas">
                            <Icons.Refresh />
                        </button>
                        <button onClick={dismissPrompts} className="p-2 text-white/30 hover:text-red-300/80 transition-colors rounded-full hover:bg-white/5" title="Dismiss">
                            <Icons.CloseSmall />
                        </button>
                    </div>
                </motion.div>
            ) : (
                /* Empty State */
                <motion.button
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => generatePrompts(true)}
                    className="text-xs text-white/20 hover:text-white/50 flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/5 transition-colors uppercase tracking-widest"
                >
                    <Icons.Sparkle />
                    <span>Need Inspiration?</span>
                </motion.button>
            )}
         </AnimatePresence>
      </div>

      {/* Attachments & Controls */}
      <div className="w-full max-w-3xl flex-none flex flex-col gap-4 px-6 pb-8 z-20">

        {/* Error Notification */}
        <div role="alert" aria-live="assertive" aria-atomic="true">
          <AnimatePresence>
              {error && (
                  <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-red-300 text-sm bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-lg backdrop-blur-md w-fit mx-auto"
                  >
                      <Icons.Alert />
                      <span>{error}</span>
                  </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* Attachment Previews */}
        <div className="flex gap-4 overflow-x-auto min-h-[60px]">
            <AnimatePresence>
                {image && (
                    <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}} className="relative group min-w-[60px] h-[60px] rounded-lg overflow-hidden border border-white/20">
                        <img src={URL.createObjectURL(image)} alt="upload" className="w-full h-full object-cover" />

                        {/* Analysis Indicators */}
                        {isAnalyzingImage && (
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                 <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                    <Icons.Eye />
                                 </motion.div>
                             </div>
                        )}
                         {!isAnalyzingImage && imageAnalysis && (
                             <div className="absolute bottom-1 right-1 text-purple-300 bg-black/50 rounded-full p-0.5" title="Analysis Complete">
                                <Icons.Sparkle />
                             </div>
                        )}

                        <button onClick={() => removeMedia('image')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Icons.X /></button>
                    </motion.div>
                )}
                {drawing && (
                    <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}} className="relative group min-w-[60px] h-[60px] rounded-lg overflow-hidden border border-white/20 bg-white/5">
                        <img src={drawing} alt="drawing" className="w-full h-full object-cover" />
                        <button onClick={() => removeMedia('drawing')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Icons.X /></button>
                    </motion.div>
                )}
                {audio && (
                    <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}} className="relative group min-w-[200px] h-auto min-h-[60px] rounded-lg border border-white/20 bg-white/5 flex flex-col justify-center px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                            <Icons.Mic />
                            <span className="truncate max-w-[120px]">Voice Note</span>
                        </div>
                        {/* Transcription Status */}
                        <div className="text-[10px] leading-tight text-white/50 italic border-l-2 border-white/10 pl-2 mt-1">
                           {isTranscribing ? (
                               <span className="flex items-center gap-1 animate-pulse">
                                   <span className="w-1 h-1 bg-white rounded-full" /> Transcribing echo...
                               </span>
                           ) : transcription ? (
                               <span className="line-clamp-2">&quot;{transcription}&quot;</span>
                           ) : (
                               <span>Recording saved</span>
                           )}
                        </div>
                        <button onClick={() => removeMedia('audio')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Icons.X /></button>
                    </motion.div>
                )}
                {documentFile && (
                    <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}} className="relative group min-w-[120px] h-[60px] rounded-lg border border-white/20 bg-white/5 flex items-center justify-center px-2">
                        <div className="flex items-center gap-2 text-xs text-white/70">
                            <Icons.File />
                            <span className="truncate max-w-[70px]">{documentFile.name}</span>
                        </div>
                        <button onClick={() => removeMedia('document')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Icons.X /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
            <div className="flex space-x-3">
                <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
                <MagneticButton onClick={() => imageInputRef.current?.click()} active={!!image} className="w-10 h-10 md:w-12 md:h-12 rounded-full" reducedMotion={reducedMotion}>
                    <span className="text-white/80"><Icons.Image /></span>
                </MagneticButton>

                <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={(e) => handleFileSelect(e, 'audio')} />

                <MagneticButton
                    onClick={toggleRecording}
                    active={isRecording}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${isRecording ? 'bg-red-500/20 border-red-500' : ''}`}
                    reducedMotion={reducedMotion}
                    shortcut="⌘+R"
                >
                    <span className={`${isRecording ? 'text-red-400 animate-pulse' : 'text-white/80'}`}>
                        {isRecording ? <Icons.MicOff /> : <Icons.Mic />}
                    </span>
                </MagneticButton>

                <input type="file" ref={docInputRef} accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleFileSelect(e, 'document')} />
                <MagneticButton onClick={() => docInputRef.current?.click()} active={!!documentFile} className="w-10 h-10 md:w-12 md:h-12 rounded-full" reducedMotion={reducedMotion}>
                    <span className="text-white/80"><Icons.File /></span>
                </MagneticButton>

                <MagneticButton
                    onClick={() => setIsDrawingModalOpen(true)}
                    active={!!drawing}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                    reducedMotion={reducedMotion}
                    shortcut="⌘+D"
                >
                    <span className="text-white/80"><Icons.Pen /></span>
                </MagneticButton>
            </div>

            <AnimatePresence>
                {(wordCount > 0 || image || drawing || audio || documentFile) && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                         <MagneticButton
                            onClick={handleNext}
                            className="h-10 md:h-12 px-6 md:px-8"
                            reducedMotion={reducedMotion}
                            shortcut="⌘+Enter"
                        >
                            <span className="text-xs md:text-sm font-serif-display text-white tracking-widest uppercase group-hover:text-purple-100 transition-colors mr-2">
                                <span className="hidden md:inline">Transform Emotion</span>
                                <span className="md:hidden">Transform</span>
                            </span>
                            <span className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-transform duration-300">
                                <Icons.ArrowRight />
                            </span>
                        </MagneticButton>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      <DrawingModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSave={(data) => setDrawing(data)}
      />

    </motion.div>
  );
};

export default EmotionalCanvas;
