/**
 * Real-time Sentiment Indicator
 * Feature 11: Emotion Detection Feedback while typing
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { apiKeyManager } from '../utils/apiKeyManager';

interface SentimentIndicatorProps {
  text: string;
  isEnabled: boolean;
  reducedMotion?: boolean;
}

interface SentimentResult {
  primaryEmotion: string;
  intensity: number; // 0-1
  color: string;
  icon: string;
}

// Emotion to visual mapping
const emotionVisuals: Record<string, { color: string; icon: string }> = {
  joy: { color: '#fbbf24', icon: '☀️' },
  sadness: { color: '#60a5fa', icon: '🌧️' },
  anger: { color: '#ef4444', icon: '🔥' },
  fear: { color: '#a78bfa', icon: '🌙' },
  love: { color: '#f472b6', icon: '💗' },
  hope: { color: '#34d399', icon: '🌱' },
  grief: { color: '#6b7280', icon: '🍂' },
  anxiety: { color: '#f97316', icon: '⚡' },
  peace: { color: '#67e8f9', icon: '🌊' },
  nostalgia: { color: '#c084fc', icon: '✨' },
  neutral: { color: '#9ca3af', icon: '○' }
};

const SentimentIndicator: React.FC<SentimentIndicatorProps> = ({
  text,
  isEnabled,
  reducedMotion = false
}) => {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnalyzedText = useRef<string>('');

  useEffect(() => {
    if (!isEnabled || text.trim().length < 20) {
      setSentiment(null);
      return;
    }

    // Debounce analysis
    if (analysisTimeout.current) {
      clearTimeout(analysisTimeout.current);
    }

    // Only analyze if text has changed meaningfully (at least 15 chars different)
    if (lastAnalyzedText.current.length > 0 && Math.abs(text.length - lastAnalyzedText.current.length) < 15) {
      return;
    }

    analysisTimeout.current = setTimeout(async () => {
      setIsAnalyzing(true);

      try {
        const userApiKey = apiKeyManager.getApiKey();
        if (!userApiKey) {
          // Fallback: basic keyword-based sentiment when no API key
          const lowerText = text.toLowerCase();
          const emotionKeywords: Record<string, string[]> = {
            joy: ['happy', 'joy', 'glad', 'wonderful', 'amazing', 'love', 'smile', 'laugh', 'blessed', 'grateful'],
            sadness: ['sad', 'cry', 'tears', 'miss', 'lonely', 'lost', 'empty', 'hurt', 'pain', 'sorrow'],
            anger: ['angry', 'furious', 'hate', 'rage', 'mad', 'frustrated', 'unfair', 'betrayed'],
            fear: ['afraid', 'scared', 'terrified', 'worry', 'anxious', 'panic', 'dread', 'nervous'],
            love: ['love', 'adore', 'cherish', 'dear', 'heart', 'affection', 'beloved', 'care'],
            hope: ['hope', 'wish', 'dream', 'believe', 'faith', 'better', 'someday', 'future'],
            grief: ['grief', 'mourn', 'loss', 'gone', 'died', 'death', 'funeral', 'passed'],
            anxiety: ['anxious', 'anxiety', 'worry', 'stress', 'overwhelm', 'restless', 'tension'],
            peace: ['peace', 'calm', 'serene', 'quiet', 'still', 'gentle', 'breathe', 'rest'],
            nostalgia: ['remember', 'memory', 'used to', 'once', 'ago', 'childhood', 'forgotten', 'past'],
          };

          let bestEmotion = 'neutral';
          let bestCount = 0;
          for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            const count = keywords.filter(kw => lowerText.includes(kw)).length;
            if (count > bestCount) {
              bestCount = count;
              bestEmotion = emotion;
            }
          }

          if (bestCount > 0) {
            const visuals = emotionVisuals[bestEmotion] ?? emotionVisuals.neutral ?? { color: '#9ca3af', icon: '○' };
            setSentiment({
              primaryEmotion: bestEmotion,
              intensity: Math.min(1, bestCount * 0.25),
              color: visuals.color,
              icon: visuals.icon
            });
          }
          lastAnalyzedText.current = text;
          setIsAnalyzing(false);
          return;
        }
        const ai = new GoogleGenAI({ apiKey: userApiKey });

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [{
              text: `Analyze the emotional tone of this text and identify the single PRIMARY emotion.

Text: "${text.slice(-500)}"

Choose from: joy, sadness, anger, fear, love, hope, grief, anxiety, peace, nostalgia, neutral

Output JSON: { "emotion": "...", "intensity": 0.0-1.0 }`
            }]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                emotion: { type: Type.STRING },
                intensity: { type: Type.NUMBER }
              }
            }
          }
        });

        const result = JSON.parse(response.text || '{}');
        const emotion = result.emotion?.toLowerCase() || 'neutral';
        const visuals = emotionVisuals[emotion] ?? emotionVisuals.neutral ?? { color: '#9ca3af', icon: '○' };

        setSentiment({
          primaryEmotion: emotion,
          intensity: Math.min(1, Math.max(0, result.intensity || 0.5)),
          color: visuals.color,
          icon: visuals.icon
        });

        lastAnalyzedText.current = text;
      } catch (err) {
        console.error('Sentiment analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 3000); // 3 second debounce

    return () => {
      if (analysisTimeout.current) {
        clearTimeout(analysisTimeout.current);
      }
    };
  }, [text, isEnabled]);

  if (!isEnabled) return null;

  return (
    <AnimatePresence mode="wait">
      {(sentiment || isAnalyzing) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
        >
          {isAnalyzing ? (
            <motion.div
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full"
            />
          ) : sentiment && (
            <>
              {/* Emotion Icon */}
              <span className="text-sm">{sentiment.icon}</span>

              {/* Emotion Label */}
              <span
                className="text-xs font-medium capitalize"
                style={{ color: sentiment.color }}
              >
                {sentiment.primaryEmotion}
              </span>

              {/* Intensity Bar */}
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sentiment.intensity * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: sentiment.color }}
                />
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SentimentIndicator;
