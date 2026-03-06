/**
 * Tests for ThemeProvider component
 * Dark-only theme provider
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme, themeColors } from '../../components/ThemeProvider';

// Test consumer component
const TestConsumer: React.FC = () => {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme', 'light-theme');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should default to dark theme', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('should always resolve to dark theme', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('should apply dark-theme class to document', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  });
});

describe('useTheme', () => {
  it('should return dark theme defaults when used outside ThemeProvider', () => {
    render(<TestConsumer />);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });
});

describe('themeColors', () => {
  it('should have dark theme colors', () => {
    expect(themeColors.dark).toBeDefined();
    expect(themeColors.dark.background).toBe('#0d0617');
    expect(themeColors.dark.text).toBe('rgba(255, 255, 255, 0.9)');
    expect(themeColors.dark.gold).toBe('#d4af37');
  });

  it('should have all required color keys', () => {
    const requiredKeys = ['background', 'backgroundSecondary', 'text', 'textMuted', 'gold', 'goldLight', 'border', 'glass', 'cardBg'];
    const darkKeys = Object.keys(themeColors.dark);
    requiredKeys.forEach(key => {
      expect(darkKeys).toContain(key);
    });
  });
});
