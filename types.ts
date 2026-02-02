


export interface Position {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface Category {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ImageAnalysis {
  description: string;
  emotionalTone: string;
  symbols: string[];
  possibleMeaning: string;
}

export interface EmotionalData {
  category: Category;
  text: string;
  image?: File | null;
  imageAnalysis?: ImageAnalysis | null;
  audio?: File | null;
  transcription?: string | null; // Added transcription
  document?: File | null;
  drawing?: string | null; // Base64 data URL
}

export interface SafetyAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  modelRationale: string;
  showCrisisOverlay: boolean;
}

export interface AftercarePractice {
  title: string;
  description: string;
  type: 'physical' | 'reflective' | 'social';
  icon: string;
}

export interface Aftercare {
  summary: string;
  practices: AftercarePractice[];
}

export interface AudioInsight {
  toneSummary: string; // Analysis of the voice/delivery
  wordSummary: string; // Analysis of the actual text spoken
  suggestedLabel: string;
}

export interface EmotionalSegment {
  text: string;
  sentiment: number; // -1 to 1
  label: string;
}

export interface EmotionalArc {
  segments: EmotionalSegment[];
  overallArc: string;
  narrativeSummary: string;
}

export interface TransformationResult {
  reflection: string;
  closureMessage: string;
  visualMetaphor: string;
  visualMetaphorPath?: string; // Abstract SVG path data
  ritual: {
    step1: string;
    step2: string;
    step3: string;
  };
  audioInsight?: AudioInsight | null;
  emotionalArc?: EmotionalArc; // Added for graph feature
  aftercare: Aftercare;
}

export interface Drawing {
    dataUrl: string;
}

export interface AccessibilitySettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  demoMode: boolean;
  theme: 'dark' | 'light' | 'system';
  aiResponseStyle: 'poetic' | 'direct' | 'therapeutic' | 'spiritual';
  sentimentIndicatorEnabled: boolean;
  guidedJournalingEnabled: boolean;
}

// AI Response Style type
export type AIResponseStyle = 'poetic' | 'direct' | 'therapeutic' | 'spiritual';

// Theme type
export type Theme = 'dark' | 'light' | 'system';

// --- Soundscape Types ---
export interface SoundscapeElement {
  type: "pad" | "bell" | "noise";
  note?: string; // e.g., "C3"
  interval?: number; // seconds (for bells)
  color?: "pink" | "brown" | "white"; // for noise
  volume: number; // 0 to 1
}

export interface SoundscapeParams {
  baseFrequency: number;
  harmonic: "major" | "minor" | "suspended" | "atonal";
  tempo: number;
  elements: SoundscapeElement[];
  description: string;
}
