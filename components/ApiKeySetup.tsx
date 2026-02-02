import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiKeyManager, ValidationResult, ApiKeyTier } from '../utils/apiKeyManager';

interface ApiKeySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyConfigured: () => void;
  isRequired?: boolean; // If true, user must configure key to proceed
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({
  isOpen,
  onClose,
  onKeyConfigured,
  isRequired = false
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [existingTier, setExistingTier] = useState<ApiKeyTier>('unknown');

  useEffect(() => {
    if (isOpen) {
      const existing = apiKeyManager.hasApiKey();
      setHasExistingKey(existing);
      setExistingTier(apiKeyManager.getApiKeyTier());
      setApiKey('');
      setValidationResult(null);
    }
  }, [isOpen]);

  const handleValidate = async () => {
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await apiKeyManager.validateApiKey(apiKey.trim());
      setValidationResult(result);

      if (result.isValid) {
        apiKeyManager.saveApiKey(apiKey.trim(), result.tier);
        setHasExistingKey(true);
        setExistingTier(result.tier);
        setTimeout(() => {
          onKeyConfigured();
        }, 1500);
      }
    } catch {
      setValidationResult({
        isValid: false,
        tier: 'unknown',
        error: 'Failed to validate API key'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = () => {
    apiKeyManager.clearApiKey();
    setHasExistingKey(false);
    setExistingTier('unknown');
    setApiKey('');
    setValidationResult(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && apiKey.trim() && !isValidating) {
      handleValidate();
    }
    if (e.key === 'Escape' && !isRequired) {
      onClose();
    }
  };

  const getTierBadge = (tier: ApiKeyTier) => {
    switch (tier) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Paid Tier
          </span>
        );
      case 'free':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Free Tier
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
            Unknown Tier
          </span>
        );
    }
  };

  const maskedKey = hasExistingKey && apiKeyManager.getApiKey()
    ? `${apiKeyManager.getApiKey()?.slice(0, 4)}${'•'.repeat(20)}${apiKeyManager.getApiKey()?.slice(-4)}`
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={isRequired ? undefined : onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-gradient-to-b from-[#1a0b2e] to-[#0d0617] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif-display text-white/90 tracking-wide">
                    API Configuration
                  </h2>
                  <p className="text-sm text-white/40 mt-1">
                    Connect your Google Gemini API key
                  </p>
                </div>
                {!isRequired && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Existing Key Display */}
              {hasExistingKey && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Current API Key</span>
                    {getTierBadge(existingTier)}
                  </div>
                  <div className="font-mono text-sm text-white/80 bg-black/30 px-3 py-2 rounded-lg">
                    {maskedKey}
                  </div>
                  <button
                    onClick={handleClearKey}
                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    Remove API Key
                  </button>
                </div>
              )}

              {/* Info Card */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-white/80 font-medium mb-1">Why do I need an API key?</p>
                    <p className="text-white/50 leading-relaxed">
                      ECHOES uses Google&apos;s Gemini AI to generate personalized emotional reflections.
                      Your API key is stored locally in your browser and never sent to our servers.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <label className="block text-sm text-white/60">
                  {hasExistingKey ? 'Enter a new API key' : 'Enter your Gemini API Key'}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setValidationResult(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="AIza..."
                    className="w-full px-4 py-3 pr-12 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all font-mono text-sm"
                    disabled={isValidating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {showKey ? (
                      <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Validation Result */}
              <AnimatePresence mode="wait">
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border ${
                      validationResult.isValid
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {validationResult.isValid ? (
                        <>
                          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-emerald-300 font-medium text-sm">API Key Verified!</p>
                            <p className="text-emerald-200/60 text-xs mt-1">
                              Detected as {validationResult.tier === 'paid' ? 'Paid' : validationResult.tier === 'free' ? 'Free' : 'Unknown'} tier.
                              Redirecting...
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-red-300 font-medium text-sm">Validation Failed</p>
                            <p className="text-red-200/60 text-xs mt-1">{validationResult.error}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Get API Key Link */}
              <div className="text-center">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>Get your free API key from Google AI Studio</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Stored locally • Never sent to our servers</span>
              </div>
              <button
                onClick={handleValidate}
                disabled={!apiKey.trim() || isValidating}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating...
                  </>
                ) : (
                  'Validate & Save'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApiKeySetup;
