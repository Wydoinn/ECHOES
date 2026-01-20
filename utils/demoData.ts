
import { TransformationResult } from '../types';

export const DEMO_RESULT: TransformationResult = {
  reflection: "I hear the weight of the words you never spoke. It is a heavy burden to carry silence where there should have been truth. Your regret is not a sign of weakness, but a testament to how much you cared. Forgiving yourself is the quietest, hardest revolution.",
  closureMessage: "I am sorry I never said this when you were here. I was afraid of my own shadow, afraid that speaking would shatter the fragile peace we had. But I know now that the truth doesn't break us—it heals us. I release the need to be perfect in your memory. I offer you my imperfect, honest love, across the distance.",
  visualMetaphor: "A single white lily floating on a dark, still obsidian lake, with ripples expanding infinitely outward into a star-filled night sky.",
  visualMetaphorPath: "M50,15 C60,5 80,10 80,30 C80,50 50,80 50,80 C50,80 20,50 20,30 C20,10 40,5 50,15 Z M50,35 C55,35 60,30 60,25 C60,20 55,15 50,15 C45,15 40,20 40,25 C40,30 45,35 50,35 Z",
  ritual: {
    step1: "Light a candle and watch the flame for one minute.",
    step2: "Whisper the words 'I forgive you' into the flame.",
    step3: "Blow out the candle and imagine the smoke carrying your burden away."
  },
  audioInsight: {
    suggestedLabel: "Trembling Courage",
    toneSummary: "There is a distinct tremor in your voice, like a leaf holding on against the wind. The pauses you take between sentences speak louder than the words themselves—moments where you are gathering the strength to be honest.",
    wordSummary: "Your words circle the edges of grief without diving in, showing a protective hesitation. The recurring mention of 'silence' suggests it is not just an absence of sound, but a heavy presence in your life."
  },
  emotionalArc: {
    overallArc: "cathartic-release",
    narrativeSummary: "A journey from the depths of silent regret to the quiet light of forgiveness.",
    segments: [
      { text: "I never said the words...", sentiment: -0.8, label: "Heavy Regret" },
      { text: "The silence grew too loud.", sentiment: -0.6, label: "Growing Tension" },
      { text: "I was just so afraid.", sentiment: -0.4, label: "Vulnerable Fear" },
      { text: "But I see clearly now.", sentiment: 0.2, label: "Emerging Clarity" },
      { text: "I forgive myself.", sentiment: 0.7, label: "Release" }
    ]
  },
  aftercare: {
    summary: "Releasing deep emotions can feel like exhaling after holding your breath for years. It is normal to feel light, tired, or tender right now.",
    practices: [
        {
            title: "Box Breathing",
            description: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Resets the nervous system.",
            icon: "🌬️",
            type: "physical"
        },
        {
            title: "Cold Water Splash",
            description: "Splash cold water on your face to activate the vagus nerve and ground yourself.",
            icon: "💧",
            type: "physical"
        },
        {
            title: "Gentle Journaling",
            description: "Write down three things you are grateful for in this exact moment.",
            icon: "✍️",
            type: "reflective"
        },
         {
            title: "Connect",
            description: "Send a simple text to someone you trust, just to say hello.",
            icon: "🤝",
            type: "social"
        }
    ]
  }
};