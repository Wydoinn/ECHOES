
import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import ParticleSystem from './components/ParticleSystem';
import CustomCursor from './components/CustomCursor';
import MorphingBlobs from './components/MorphingBlobs';
import Landing from './screens/Landing';
import CategorySelection from './screens/CategorySelection';
import EmotionalCanvas from './screens/EmotionalCanvas';
import ProcessingScreen from './screens/ProcessingScreen';
import RevelationScreen from './screens/RevelationScreen';
import { Category, EmotionalData, TransformationResult, AccessibilitySettings } from './types';
import SoundManager, { SoundProvider } from './components/SoundManager';
import SafetyRail from './components/SafetyRail';
import BreathingExercise from './components/BreathingExercise';
import AccessibilityControls from './components/AccessibilityControls';
import PrivacyNotice from './components/PrivacyNotice';
import { getTimeContext } from './utils/timeAwareness';
import { sessionMemory } from './utils/sessionMemory';

type Screen = 'landing' | 'category' | 'breathing' | 'canvas' | 'processing' | 'revelation';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [emotionalData, setEmotionalData] = useState<EmotionalData | null>(null);
  const [transformationResult, setTransformationResult] = useState<TransformationResult | null>(null);
  const [showSafetyRail, setShowSafetyRail] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);

  const [settings, setSettings] = useState<AccessibilitySettings>({
    soundEnabled: true,
    reducedMotion: false,
    highContrast: false,
    demoMode: false
  });

  // Calculate Time Context & Session Insight on Render/Mount
  const timeContext = getTimeContext();
  const sessionInsight = useMemo(() => sessionMemory.getInsight(), []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
        // Cmd/Ctrl + M: Toggle Sound
        if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
            e.preventDefault();
            setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
        }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Personalized Greeting logic
  const greeting = sessionInsight?.isReturning 
    ? `Welcome back. ${timeContext.greeting.charAt(0).toLowerCase() + timeContext.greeting.slice(1)}`
    : timeContext.greeting;

  const handleCategorySelect = (category: Category) => {
    setPendingCategory(category);
    setShowSafetyRail(true);
  };

  const handleSafetyProceed = () => {
    setShowSafetyRail(false);
    if (pendingCategory) {
        setSelectedCategory(pendingCategory);
        setScreen('breathing');
    }
  };

  const handleSafetyCancel = () => {
      setShowSafetyRail(false);
      setPendingCategory(null);
  };

  const handleBreathingComplete = () => {
      setScreen('canvas');
  };

  const handleCanvasNext = (data: EmotionalData) => {
    setEmotionalData(data);
    setScreen('processing');
  };

  const handleProcessingComplete = (result: TransformationResult) => {
    setTransformationResult(result);
    
    // Save Session Memory
    if (emotionalData && selectedCategory) {
        const wordCount = emotionalData.text.trim().split(/\s+/).length;
        sessionMemory.save({
            id: Date.now().toString(),
            timestamp: Date.now(),
            categoryId: selectedCategory.id,
            categoryTitle: selectedCategory.title,
            wordCount: isNaN(wordCount) ? 0 : wordCount,
            hadAudio: !!emotionalData.audio,
            hadImage: !!emotionalData.image
        });
    }

    setTimeout(() => {
        setScreen('revelation');
    }, 1000);
  };
  
  const handleRestart = () => {
    setEmotionalData(null);
    setSelectedCategory(null);
    setTransformationResult(null);
    setPendingCategory(null);
    setScreen('landing');
  };

  return (
    <SoundProvider enabled={settings.soundEnabled}>
      <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "user"}>
        <div 
          className="antialiased text-white min-h-screen relative selection:bg-purple-500/30 overflow-x-hidden bg-[#0d0617]"
          style={{ cursor: settings.reducedMotion ? 'auto' : 'none' }}
        >
        
          {/* Global Components */}
          <SoundManager />
          {!settings.reducedMotion && <CustomCursor />}
          <AccessibilityControls settings={settings} onUpdate={setSettings} />
          <PrivacyNotice />
          
          {/* Backgrounds - Conditional & Optimized */}
          {screen !== 'processing' && (
            <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
                {!settings.reducedMotion && <ParticleSystem color={timeContext.particleColor} />}
                <MorphingBlobs reducedMotion={settings.reducedMotion} period={timeContext.period} />
            </div>
          )}
          
          {/* Safety Overlay */}
          <AnimatePresence>
              {showSafetyRail && (
                  <SafetyRail onProceed={handleSafetyProceed} onCancel={handleSafetyCancel} />
              )}
          </AnimatePresence>

          {/* Screens */}
          <main className="relative z-10 w-full min-h-screen">
            <AnimatePresence mode="wait">
              {screen === 'landing' && (
                <Landing 
                  key="landing" 
                  onEnter={() => setScreen('category')} 
                  reducedMotion={settings.reducedMotion}
                  greeting={greeting}
                />
              )}
              {screen === 'category' && (
                <CategorySelection 
                  key="category" 
                  onSelect={handleCategorySelect} 
                  reducedMotion={settings.reducedMotion}
                />
              )}
              {screen === 'breathing' && (
                  <BreathingExercise 
                     key="breathing"
                     onComplete={handleBreathingComplete}
                     onSkip={handleBreathingComplete}
                  />
              )}
              {screen === 'canvas' && selectedCategory && (
                <EmotionalCanvas 
                  key="canvas" 
                  category={selectedCategory} 
                  onNext={handleCanvasNext} 
                  reducedMotion={settings.reducedMotion}
                />
              )}
              {screen === 'processing' && emotionalData && (
                <ProcessingScreen 
                    key="processing" 
                    data={emotionalData} 
                    onComplete={handleProcessingComplete}
                    onCancel={() => setScreen('canvas')}
                    onRestart={handleRestart}
                    isDemoMode={settings.demoMode}
                    reducedMotion={settings.reducedMotion}
                />
              )}
              {screen === 'revelation' && transformationResult && emotionalData && (
                <RevelationScreen 
                    key="revelation" 
                    result={transformationResult} 
                    originalData={emotionalData}
                    onRestart={handleRestart}
                    reducedMotion={settings.reducedMotion}
                />
              )}
            </AnimatePresence>
          </main>
          
          {/* Optimized Film Grain */}
          <div 
            className="fixed inset-0 pointer-events-none opacity-[0.05] z-50 mix-blend-overlay" 
            style={{ 
                backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAA5OTkAAABMTExERERmZmYzMzMyMjJ4D36MAAAABHRSTlMAMwA174AF9QAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfmBQUKOhw0Q88yAAAArklEQVQ4y2NgQAX8DIwsCgwM7ICQhYGBYTtk8TIwMMC1QwVcDAwM7VAl/AwMDP9hSvhZAQoYYZoF2mFmYGBg+A8z7T/MdP4P0ywGhn8w0/8zMDD8Z2Bg+A/D/P8fpoCBEaYQhgl8MAV8MIV8MEX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MMX8MAMAcl597/6Wp6gAAAAASUVORK5CYII=")`,
                backgroundRepeat: 'repeat',
            }} 
          />
        </div>
      </MotionConfig>
    </SoundProvider>
  );
}

export default App;
