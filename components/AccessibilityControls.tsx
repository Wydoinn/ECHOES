import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AccessibilitySettings, AIResponseStyle } from '../types';
import AIResponseStyleSelector from './AIResponseStyleSelector';
import ApiKeySetup from './ApiKeySetup';
import { supportedLanguages } from '../i18n';
import { apiKeyManager } from '../utils/apiKeyManager';

interface AccessibilityControlsProps {
  settings: AccessibilitySettings;
  onUpdate: (newSettings: AccessibilitySettings) => void;
  onOpenHistory?: () => void;
  onOpenAnalytics?: () => void;
}

// Icons
const Icons = {
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]/70"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/><circle cx="12" cy="12" r="4"/></svg>,
  History: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Analytics: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  Key: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
};

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  settings,
  onUpdate,
  onOpenHistory,
  onOpenAnalytics
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(apiKeyManager.hasApiKey());
  const [apiKeyTier, setApiKeyTier] = useState(apiKeyManager.getApiKeyTier());

  // Refresh API key status when modal closes
  useEffect(() => {
    if (!showApiKeySetup) {
      setHasApiKey(apiKeyManager.hasApiKey());
      setApiKeyTier(apiKeyManager.getApiKeyTier());
    }
  }, [showApiKeySetup]);

  const aiStyleLabels: Record<AIResponseStyle, string> = {
    poetic: `✨ ${t('aiStyles.poetic.name')}`,
    direct: `💎 ${t('aiStyles.direct.name')}`,
    therapeutic: `🌱 ${t('aiStyles.therapeutic.name')}`,
    spiritual: `🌙 ${t('aiStyles.spiritual.name')}`
  };

  const toggle = (key: keyof AccessibilitySettings) => {
    if (key === 'theme' || key === 'aiResponseStyle') return;
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const cycleTheme = () => {
    const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length] ?? 'dark';
    onUpdate({ ...settings, theme: nextTheme });
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const currentLanguage = supportedLanguages.find(l => l.code === i18n.language) ?? supportedLanguages[0] ?? { code: 'en', name: 'English', nativeName: 'English' };

  return (
    <>
      {/* Premium Toggle Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-[#0d0617]/60 backdrop-blur-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Settings"
      >
        <Icons.Settings />
      </motion.button>

      {/* Premium Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 right-6 z-50 w-80 bg-gradient-to-b from-[#1a0b2e]/98 to-[#0d0617]/98 backdrop-blur-2xl border border-[#d4af37]/20 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Premium corner accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-[#d4af37]/20 rounded-tl-sm"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-[#d4af37]/20 rounded-tr-sm"></div>

            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/60 mb-6 font-medium">{t('settings.title')}</h3>

            <div className="space-y-5">
              {/* Sound */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm font-light">{t('settings.sound')}</span>
                <button
                  onClick={() => toggle('soundEnabled')}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ${settings.soundEnabled ? 'bg-gradient-to-r from-[#d4af37] to-purple-600 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/10 border border-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm font-light">{t('settings.reducedMotion')}</span>
                <button
                  onClick={() => toggle('reducedMotion')}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ${settings.reducedMotion ? 'bg-gradient-to-r from-[#d4af37] to-purple-600 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/10 border border-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${settings.reducedMotion ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Sentiment Indicator */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm font-light">{t('settings.sentimentIndicator')}</span>
                <button
                  onClick={() => toggle('sentimentIndicatorEnabled')}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ${settings.sentimentIndicatorEnabled ? 'bg-gradient-to-r from-[#d4af37] to-purple-600 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/10 border border-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${settings.sentimentIndicatorEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Guided Journaling */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm font-light">Guided Mode</span>
                <button
                  onClick={() => toggle('guidedJournalingEnabled')}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ${settings.guidedJournalingEnabled ? 'bg-gradient-to-r from-[#d4af37] to-purple-600 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/10 border border-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${settings.guidedJournalingEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm font-light">{t('settings.theme')}</span>
                <button
                  onClick={cycleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition-all text-sm text-white/70"
                >
                  {settings.theme === 'dark' && <><Icons.Moon /> {t('settings.dark')}</>}
                  {settings.theme === 'light' && <><Icons.Sun /> {t('settings.light')}</>}
                  {settings.theme === 'system' && <>⚙️ System</>}
                </button>
              </div>

              {/* AI Response Style */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm font-light">{t('settings.aiVoice')}</span>
                <button
                  onClick={() => setShowStyleSelector(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition-all text-sm text-white/70"
                >
                  {aiStyleLabels[settings.aiResponseStyle]}
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between relative">
                <span className="text-white/70 text-sm font-light">{t('settings.language')}</span>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition-all text-sm text-white/70"
                >
                  <Icons.Globe /> {currentLanguage.nativeName}
                </button>

                {/* Language Dropdown */}
                <AnimatePresence>
                  {showLanguageMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-[#1a0b2e] border border-white/10 rounded-lg overflow-hidden shadow-xl z-10"
                    >
                      {supportedLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            i18n.language === lang.code
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <p className="text-[9px] text-white/30 uppercase tracking-wider mb-3">Quick Actions</p>

              {/* API Key Configuration */}
              <button
                onClick={() => { setShowApiKeySetup(true); setIsOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <div className="flex items-center gap-2 text-white/60">
                  <Icons.Key />
                  <span className="text-xs">API Key</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasApiKey ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      apiKeyTier === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : apiKeyTier === 'free'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {apiKeyTier === 'paid' ? 'Paid' : apiKeyTier === 'free' ? 'Free' : 'Set'}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                      Required
                    </span>
                  )}
                </div>
              </button>

              <div className="flex gap-2">
                {onOpenHistory && (
                  <button
                    onClick={() => { onOpenHistory(); setIsOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-xs transition-all"
                  >
                    <Icons.History /> {t('history.title')}
                  </button>
                )}
                {onOpenAnalytics && (
                  <button
                    onClick={() => { onOpenAnalytics(); setIsOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-xs transition-all"
                  >
                    <Icons.Analytics /> {t('analytics.title')}
                  </button>
                )}
              </div>
            </div>

            {/* Bottom decorative line */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[9px] text-white/30 text-center tracking-wider">Press ESC to close • ⌘H History • ⌘I Insights</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response Style Selector Modal */}
      <AIResponseStyleSelector
        isOpen={showStyleSelector}
        currentStyle={settings.aiResponseStyle}
        onSelect={(style) => onUpdate({ ...settings, aiResponseStyle: style })}
        onClose={() => setShowStyleSelector(false)}
      />

      {/* API Key Setup Modal */}
      <ApiKeySetup
        isOpen={showApiKeySetup}
        onClose={() => setShowApiKeySetup(false)}
        onKeyConfigured={() => {
          setShowApiKeySetup(false);
          setHasApiKey(true);
          setApiKeyTier(apiKeyManager.getApiKeyTier());
        }}
      />
    </>
  );
};

export default AccessibilityControls;
