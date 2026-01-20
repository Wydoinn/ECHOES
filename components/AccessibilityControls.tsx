import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibilitySettings } from '../types';

interface AccessibilityControlsProps {
  settings: AccessibilitySettings;
  onUpdate: (newSettings: AccessibilitySettings) => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ settings, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (key: keyof AccessibilitySettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/><circle cx="12" cy="12" r="4"/></svg>
      </motion.button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            className="fixed top-20 right-6 z-50 w-64 bg-[#1a0b2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">Experience Controls</h3>
            
            <div className="space-y-4">
              {/* Sound */}
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Sound</span>
                <button 
                  onClick={() => toggle('soundEnabled')}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-purple-600' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.soundEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Reduced Motion</span>
                <button 
                  onClick={() => toggle('reducedMotion')}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.reducedMotion ? 'bg-purple-600' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.reducedMotion ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityControls;