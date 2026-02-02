/**
 * Gemini API Type Definitions
 * Provides strong typing for Google Gemini API interactions
 */

// =============================================================================
// Request Types
// =============================================================================

export interface GeminiTextPart {
  text: string;
}

export interface GeminiInlineDataPart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export type GeminiContentPart = GeminiTextPart | GeminiInlineDataPart;

export interface GeminiContent {
  parts: GeminiContentPart[];
  role?: 'user' | 'model';
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseMimeType?: string;
  responseSchema?: GeminiSchemaType;
}

export interface GeminiSafetySettings {
  category: string;
  threshold: string;
}

export interface GeminiRequest {
  model: string;
  contents: GeminiContent | GeminiContent[];
  config?: {
    systemInstruction?: string;
    generationConfig?: GeminiGenerationConfig;
    safetySettings?: GeminiSafetySettings[];
    responseMimeType?: string;
    responseSchema?: GeminiSchemaType;
  };
}

// =============================================================================
// Schema Types (for JSON output)
// =============================================================================

export interface GeminiSchemaProperty {
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
  description?: string;
  enum?: string[];
  items?: GeminiSchemaType;
  properties?: Record<string, GeminiSchemaProperty>;
  required?: string[];
}

export interface GeminiSchemaType {
  type: 'OBJECT' | 'ARRAY' | 'STRING' | 'NUMBER' | 'BOOLEAN';
  properties?: Record<string, GeminiSchemaProperty>;
  items?: GeminiSchemaType;
  required?: string[];
  description?: string;
  enum?: string[];
}

// =============================================================================
// Response Types
// =============================================================================

export interface GeminiCandidate {
  content: {
    parts: GeminiTextPart[];
    role: string;
  };
  finishReason: string;
  index: number;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// =============================================================================
// Application-Specific Types
// =============================================================================

export interface PromptGenerationResponse {
  questions: string[];
}

export interface ImageAnalysisResponse {
  description: string;
  emotionalTone: string;
  symbols: string[];
  possibleMeaning: string;
}

export interface SentimentAnalysisResponse {
  emotion: string;
  intensity: number;
}

export interface SafetyAssessmentResponse {
  riskLevel: 'low' | 'medium' | 'high';
  modelRationale: string;
  showCrisisOverlay: boolean;
}

export interface EmotionalSegmentResponse {
  text: string;
  sentiment: number;
  label: string;
}

export interface EmotionalArcResponse {
  segments: EmotionalSegmentResponse[];
  overallArc: string;
  narrativeSummary: string;
}

export interface AftercarePracticeResponse {
  title: string;
  description: string;
  icon: string;
  type: 'physical' | 'reflective' | 'social';
}

export interface AftercareResponse {
  summary: string;
  practices: AftercarePracticeResponse[];
}

export interface AudioInsightResponse {
  toneSummary: string;
  wordSummary: string;
  suggestedLabel: string;
}

export interface RitualResponse {
  step1: string;
  step2: string;
  step3: string;
}

export interface TransformationResultResponse {
  reflection: string;
  closureMessage: string;
  visualMetaphor: string;
  visualMetaphorPath: string;
  ritual: RitualResponse;
  emotionalArc: EmotionalArcResponse;
  aftercare: AftercareResponse;
  audioInsight?: AudioInsightResponse;
}

export interface SoundscapeElementResponse {
  type: 'pad' | 'bell' | 'noise';
  note?: string;
  interval?: number;
  color?: 'pink' | 'brown' | 'white';
  volume: number;
}

export interface SoundscapeResponse {
  baseFrequency: number;
  harmonic: 'major' | 'minor' | 'suspended';
  tempo: number;
  elements: SoundscapeElementResponse[];
  description: string;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Helper type to extract text from Gemini response
 */
export function extractTextFromResponse(response: GeminiResponse): string {
  return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Type guard to check if a part is text
 */
export function isTextPart(part: GeminiContentPart): part is GeminiTextPart {
  return 'text' in part;
}

/**
 * Type guard to check if a part is inline data
 */
export function isInlineDataPart(part: GeminiContentPart): part is GeminiInlineDataPart {
  return 'inlineData' in part;
}
