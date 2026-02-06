/**
 * Theme Provider - Dark Theme Only (ECHOES Brand)
 * Single cohesive dark luxury theme
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';

export type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'dark', resolvedTheme: 'dark' };
  }
  return context;
};

// ECHOES Dark Theme Colors
export const themeColors = {
  dark: {
    background: '#0d0617',
    backgroundSecondary: '#1a0b2e',
    text: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    gold: '#d4af37',
    goldLight: '#f4e5b2',
    border: 'rgba(255, 255, 255, 0.1)',
    glass: 'rgba(255, 255, 255, 0.03)',
    cardBg: 'rgba(26, 11, 46, 0.98)',
  }
};
