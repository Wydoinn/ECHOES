import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../types';

interface GuidedJournalingProps {
  isEnabled: boolean;
  category: Category;
  onPromptChange: (prompt: string) => void;
  currentWordCount: number;
}

interface JourneyStep {
  id: number;
  prompt: string;
  minWords: number;
  icon: string;
}

// Journey steps based on category
const getJourneySteps = (categoryId: string): JourneyStep[] => {
  const baseSteps: Record<string, JourneyStep[]> = {
    grief: [
      { id: 1, prompt: "Describe the person or thing you've lost. What made them special?", minWords: 30, icon: "💫" },
      { id: 2, prompt: "What moment together do you treasure most?", minWords: 40, icon: "🌟" },
      { id: 3, prompt: "What do you wish you could tell them now?", minWords: 30, icon: "💌" },
      { id: 4, prompt: "How has this loss changed you?", minWords: 30, icon: "🌱" },
      { id: 5, prompt: "What would they want you to know today?", minWords: 20, icon: "✨" },
    ],
    regret: [
      { id: 1, prompt: "Describe the moment or decision that haunts you.", minWords: 30, icon: "🔮" },
      { id: 2, prompt: "What did you hope would happen instead?", minWords: 30, icon: "🌙" },
      { id: 3, prompt: "What circumstances led to this choice?", minWords: 40, icon: "🌊" },
      { id: 4, prompt: "If you could speak to your past self, what would you say?", minWords: 30, icon: "💫" },
      { id: 5, prompt: "What has this taught you about yourself?", minWords: 20, icon: "🦋" },
    ],
    heartbreak: [
      { id: 1, prompt: "Describe the love you experienced. What made it meaningful?", minWords: 30, icon: "💗" },
      { id: 2, prompt: "When did you first feel things changing?", minWords: 30, icon: "🥀" },
      { id: 3, prompt: "What do you miss most?", minWords: 30, icon: "🌙" },
      { id: 4, prompt: "What parts of yourself did you discover through this love?", minWords: 30, icon: "🔮" },
      { id: 5, prompt: "What does your heart need to hear right now?", minWords: 20, icon: "🌸" },
    ],
    anxiety: [
      { id: 1, prompt: "Name the fear that feels most present right now.", minWords: 20, icon: "🌑" },
      { id: 2, prompt: "Where do you feel this anxiety in your body?", minWords: 30, icon: "🫀" },
      { id: 3, prompt: "What's the worst outcome you imagine? Describe it fully.", minWords: 40, icon: "🌪️" },
      { id: 4, prompt: "What evidence contradicts this fear?", minWords: 30, icon: "🌤️" },
      { id: 5, prompt: "What would peace look like for you right now?", minWords: 20, icon: "🕊️" },
    ],
    anger: [
      { id: 1, prompt: "Describe what happened. Let the raw truth emerge.", minWords: 40, icon: "🔥" },
      { id: 2, prompt: "What boundary was crossed? What felt violated?", minWords: 30, icon: "⚡" },
      { id: 3, prompt: "What did you need that wasn't given?", minWords: 30, icon: "💎" },
      { id: 4, prompt: "If your anger could speak, what would it say?", minWords: 30, icon: "🗡️" },
      { id: 5, prompt: "What would true justice or resolution look like?", minWords: 20, icon: "⚖️" },
    ],
    emptiness: [
      { id: 1, prompt: "Describe the void you feel. What shape does it take?", minWords: 30, icon: "🕳️" },
      { id: 2, prompt: "When did you last feel fully alive? What was happening?", minWords: 40, icon: "✨" },
      { id: 3, prompt: "What dreams have you set aside?", minWords: 30, icon: "🌙" },
      { id: 4, prompt: "If meaning could find you, what form would it take?", minWords: 30, icon: "🧭" },
      { id: 5, prompt: "What small thing still sparks something in you?", minWords: 20, icon: "🕯️" },
    ],
  };

  return baseSteps[categoryId] ?? baseSteps.grief ?? [];
};

const GuidedJournaling: React.FC<GuidedJournalingProps> = ({
  isEnabled,
  category,
  onPromptChange,
  currentWordCount
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = getJourneySteps(category.id);
  const currentStepData = steps[currentStep];

  // Check if current step is complete based on word count
  const isCurrentStepComplete = currentWordCount >= (currentStepData?.minWords || 0);

  // Progress to next step when conditions are met
  useEffect(() => {
    if (isCurrentStepComplete && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
  }, [isCurrentStepComplete, currentStep, completedSteps]);

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= completedSteps.length) {
      setCurrentStep(stepIndex);
      const step = steps[stepIndex];
      if (step) onPromptChange(step.prompt);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const step = steps[nextStep];
      if (step) onPromptChange(step.prompt);
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="mb-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-4 px-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isAccessible = index <= completedSteps.length;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(index)}
                disabled={!isAccessible}
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300
                  ${isCurrent
                    ? 'bg-gradient-to-br from-amber-400 to-purple-600 shadow-lg shadow-amber-500/30 scale-110'
                    : isCompleted
                      ? 'bg-amber-500/30 text-amber-300'
                      : isAccessible
                        ? 'bg-white/10 text-white/40 hover:bg-white/15'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }
                `}
                aria-label={`Step ${index + 1}: ${step.prompt}`}
              >
                {step.icon}
                {isCompleted && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-gradient-to-r from-amber-500 to-purple-500' : 'bg-white/10'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Prompt Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-amber-400/60">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-[10px] text-white/40">
              {currentWordCount} / {currentStepData?.minWords ?? 0}+ words
            </span>
          </div>

          {/* Prompt */}
          <p className="text-lg font-serif-body text-white/90 leading-relaxed mb-4">
            {currentStepData?.prompt}
          </p>

          {/* Progress bar for current step */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-purple-500"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (currentWordCount / (currentStepData?.minWords ?? 1)) * 100)}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Next button */}
          {isCurrentStepComplete && currentStep < steps.length - 1 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleNext}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
            >
              Continue to next reflection →
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Completion message */}
      {completedSteps.length === steps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30">
            <span className="text-lg">✨</span>
            <span className="text-sm text-amber-300">Journey complete — Ready for transformation</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GuidedJournaling;
