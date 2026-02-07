
import { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import ParticleSystem from './components/ParticleSystem';
import CustomCursor from './components/CustomCursor';
import MorphingBlobs from './components/MorphingBlobs';
import { Category, EmotionalData, TransformationResult, AccessibilitySettings } from './types';
import SoundManager, { SoundProvider } from './components/SoundManager';
import SafetyRail from './components/SafetyRail';
import AccessibilityControls from './components/AccessibilityControls';
import PrivacyNotice from './components/PrivacyNotice';
import ErrorBoundary from './components/ErrorBoundary';
import ApiKeySetup from './components/ApiKeySetup';
import { PrivacyPolicy, TermsOfService } from './screens/LegalPages';
import { getTimeContext } from './utils/timeAwareness';
import { sessionMemory } from './utils/sessionMemory';
import { draftManager, DraftData } from './utils/draftManager';
import { apiKeyManager } from './utils/apiKeyManager';
import { STORAGE_KEYS } from './utils/constants';

// Lazy load screens for code splitting
const Landing = lazy(() => import('./screens/Landing'));
const CategorySelection = lazy(() => import('./screens/CategorySelection'));
const EmotionalCanvas = lazy(() => import('./screens/EmotionalCanvas'));
const ProcessingScreen = lazy(() => import('./screens/ProcessingScreen'));
const RevelationScreen = lazy(() => import('./screens/RevelationScreen'));
const BreathingExercise = lazy(() => import('./components/BreathingExercise'));
const SessionHistoryDashboard = lazy(() => import('./components/SessionHistoryDashboard'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));

type Screen = 'landing' | 'category' | 'breathing' | 'canvas' | 'processing' | 'revelation' | 'privacy' | 'terms';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0d0617]">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      <p className="text-white/50 text-sm">Loading...</p>
    </motion.div>
  </div>
);

// Load settings from localStorage
const loadSettings = (): AccessibilitySettings => {
  try {
    const saved = localStorage.getItem('echoes_settings');
    if (saved) {
      return { ...getDefaultSettings(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return getDefaultSettings();
};

const getDefaultSettings = (): AccessibilitySettings => ({
  soundEnabled: true,
  reducedMotion: false,
  highContrast: false,
  demoMode: false,
  theme: 'dark',
  aiResponseStyle: 'poetic',
  sentimentIndicatorEnabled: true,
  guidedJournalingEnabled: false
});

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [emotionalData, setEmotionalData] = useState<EmotionalData | null>(null);
  const [transformationResult, setTransformationResult] = useState<TransformationResult | null>(null);
  const [showSafetyRail, setShowSafetyRail] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('landing');

  // Feature 10: Session History & Analytics Dashboards
  const [showHistoryDashboard, setShowHistoryDashboard] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // Draft resume state
  const [pendingDraftResume, setPendingDraftResume] = useState<DraftData | null>(null);

  // API Key setup state
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [pendingCanvasData, setPendingCanvasData] = useState<EmotionalData | null>(null);

  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('echoes_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Apply dark theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  }, []);

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
        // Cmd/Ctrl + H: Toggle History Dashboard
        if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
            e.preventDefault();
            setShowHistoryDashboard(prev => !prev);
        }
        // Cmd/Ctrl + I: Toggle Analytics/Insights Dashboard
        if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
            e.preventDefault();
            setShowAnalyticsDashboard(prev => !prev);
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

    // Show safety rail only once per calendar day (or on first visit)
    const lastShown = localStorage.getItem(STORAGE_KEYS.SAFETY_RAIL_LAST_SHOWN);
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (lastShown === today) {
      // Already shown today — skip directly to breathing
      setSelectedCategory(category);
      setScreen('breathing');
      return;
    }
    setShowSafetyRail(true);
  };

  const handleSafetyProceed = () => {
    setShowSafetyRail(false);
    // Record that the reminder was shown today
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SAFETY_RAIL_LAST_SHOWN, today);
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
    // Check if API key is configured (skip for demo mode)
    if (!settings.demoMode && !apiKeyManager.hasApiKey()) {
      setPendingCanvasData(data);
      setShowApiKeySetup(true);
      return;
    }

    setEmotionalData(data);
    // Clear the draft when moving to processing
    draftManager.archiveDraft();
    draftManager.clearCurrentDraft();
    setScreen('processing');
  };

  // Handle API key configured - continue to processing
  const handleApiKeyConfigured = () => {
    setShowApiKeySetup(false);
    if (pendingCanvasData) {
      setEmotionalData(pendingCanvasData);
      setPendingCanvasData(null);
      draftManager.archiveDraft();
      draftManager.clearCurrentDraft();
      setScreen('processing');
    }
  };

  // Handle draft resume from history dashboard
  const handleResumeDraft = (draft: DraftData) => {
    setPendingDraftResume(draft);
    setShowHistoryDashboard(false);
    // Navigate to canvas with the draft's category
    const mockCategory: Category = {
      id: draft.categoryId,
      title: draft.categoryTitle,
      icon: '✦', // Default icon
      description: ''
    };
    setSelectedCategory(mockCategory);
    setScreen('canvas');
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
    setPendingDraftResume(null);
    setScreen('landing');
  };

  // Handle opening history/analytics from landing or anywhere
  const handleOpenHistory = () => setShowHistoryDashboard(true);
  const handleOpenAnalytics = () => setShowAnalyticsDashboard(true);

  // Legal page navigation
  // Only update previousScreen when navigating FROM a non-legal screen.
  // This prevents the stale-state bug where opening Terms from Privacy
  // overwrites previousScreen with 'privacy', making Privacy unclosable.
  const handleOpenPrivacy = () => {
    if (screen !== 'privacy' && screen !== 'terms') {
      setPreviousScreen(screen);
    }
    setScreen('privacy');
  };

  const handleOpenTerms = () => {
    if (screen !== 'privacy' && screen !== 'terms') {
      setPreviousScreen(screen);
    }
    setScreen('terms');
  };

  const handleLegalBack = () => {
    setScreen(previousScreen);
  };

  return (
    <ErrorBoundary>
    <SoundProvider enabled={settings.soundEnabled}>
      <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "user"}>
        <div
          className="antialiased text-white min-h-screen relative selection:bg-purple-500/30 overflow-x-hidden bg-[#0d0617]"
          style={{ cursor: settings.reducedMotion ? 'auto' : 'none' }}
        >
          {/* Skip to Content - Accessibility */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>

          {/* Global Components */}
          <SoundManager />
          {!settings.reducedMotion && <CustomCursor />}
          <AccessibilityControls
            settings={settings}
            onUpdate={setSettings}
            onOpenHistory={handleOpenHistory}
            onOpenAnalytics={handleOpenAnalytics}
          />
          <PrivacyNotice onOpenPrivacy={handleOpenPrivacy} onOpenTerms={handleOpenTerms} />

          {/* Feature 10: Session History Dashboard */}
          <Suspense fallback={null}>
            <SessionHistoryDashboard
              isOpen={showHistoryDashboard}
              onClose={() => setShowHistoryDashboard(false)}
              onResumeDraft={handleResumeDraft}
            />
          </Suspense>

          {/* Feature 14: Analytics Dashboard */}
          <Suspense fallback={null}>
            <AnalyticsDashboard
              isOpen={showAnalyticsDashboard}
              onClose={() => setShowAnalyticsDashboard(false)}
            />
          </Suspense>

          {/* Backgrounds - Always visible with purple theme */}
          <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
              {!settings.reducedMotion && <ParticleSystem color={timeContext.particleColor} />}
              <MorphingBlobs reducedMotion={settings.reducedMotion} period={timeContext.period} />
          </div>

          {/* Safety Overlay */}
          <AnimatePresence>
              {showSafetyRail && (
                  <SafetyRail onProceed={handleSafetyProceed} onCancel={handleSafetyCancel} />
              )}
          </AnimatePresence>

          {/* API Key Setup Modal */}
          <ApiKeySetup
            isOpen={showApiKeySetup}
            onClose={() => {
              setShowApiKeySetup(false);
              setPendingCanvasData(null);
            }}
            onKeyConfigured={handleApiKeyConfigured}
            isRequired={!!pendingCanvasData}
          />

          {/* Screens */}
          <main id="main-content" className="relative z-10 w-full min-h-screen">
            <Suspense fallback={<LoadingFallback />}>
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
                  onRestart={handleRestart}
                  reducedMotion={settings.reducedMotion}
                />
              )}
              {screen === 'breathing' && (
                  <BreathingExercise
                     key="breathing"
                     onComplete={handleBreathingComplete}
                     onSkip={handleBreathingComplete}
                     onRestart={handleRestart}
                  />
              )}
              {screen === 'canvas' && selectedCategory && (
                <EmotionalCanvas
                  key="canvas"
                  category={selectedCategory}
                  onNext={handleCanvasNext}
                  onRestart={handleRestart}
                  reducedMotion={settings.reducedMotion}
                  aiResponseStyle={settings.aiResponseStyle}
                  sentimentIndicatorEnabled={settings.sentimentIndicatorEnabled}
                  guidedJournalingEnabled={settings.guidedJournalingEnabled}
                  initialDraft={pendingDraftResume}
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
                    aiResponseStyle={settings.aiResponseStyle}
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
              {screen === 'privacy' && (
                <PrivacyPolicy
                    key="privacy"
                    onBack={handleLegalBack}
                />
              )}
              {screen === 'terms' && (
                <TermsOfService
                    key="terms"
                    onBack={handleLegalBack}
                />
              )}
            </AnimatePresence>
            </Suspense>
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
    </ErrorBoundary>
  );
}

export default App;
