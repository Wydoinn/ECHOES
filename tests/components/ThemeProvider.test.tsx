/**
 * Tests for ThemeProvider component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme, themeColors } from '../../components/ThemeProvider';

// Test consumer component
const TestConsumer: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>System</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mediaQueryListeners: ((e: { matches: boolean }) => void)[];

  beforeEach(() => {
    mediaQueryListeners = [];
    mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn((_event: string, listener: (e: { matches: boolean }) => void) => {
        mediaQueryListeners.push(listener);
      }),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;
    localStorage.clear();
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

  it('should load saved theme from localStorage', () => {
    localStorage.setItem('echoes_theme', 'light');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('should change theme when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');

    fireEvent.click(screen.getByTestId('set-light'));

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(localStorage.getItem('echoes_theme')).toBe('light');
  });

  it('should save theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-light'));

    expect(localStorage.getItem('echoes_theme')).toBe('light');
  });

  it('should resolve system theme to dark when prefers-color-scheme is dark', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-system'));

    expect(screen.getByTestId('theme').textContent).toBe('system');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('should resolve system theme to light when prefers-color-scheme is light', () => {
    mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query !== '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn((_event: string, listener: (e: { matches: boolean }) => void) => {
        mediaQueryListeners.push(listener);
      }),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-system'));

    expect(screen.getByTestId('theme').textContent).toBe('system');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('should apply light-theme class to document when light theme is set', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-light'));

    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
  });

  it('should apply dark-theme class to document when dark theme is set', () => {
    localStorage.setItem('echoes_theme', 'light');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));

    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  });
});

describe('useTheme', () => {
  it('should throw error when used outside ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});

describe('themeColors', () => {
  it('should have dark theme colors', () => {
    expect(themeColors.dark).toBeDefined();
    expect(themeColors.dark.background).toBe('#0d0617');
    expect(themeColors.dark.text).toBe('rgba(255, 255, 255, 0.9)');
    expect(themeColors.dark.gold).toBe('#d4af37');
  });

  it('should have light theme colors', () => {
    expect(themeColors.light).toBeDefined();
    expect(themeColors.light.background).toBe('#f8f6f2');
    expect(themeColors.light.text).toBe('rgba(13, 6, 23, 0.9)');
    expect(themeColors.light.gold).toBe('#9a7b2b');
  });

  it('should have matching keys for both themes', () => {
    const darkKeys = Object.keys(themeColors.dark);
    const lightKeys = Object.keys(themeColors.light);
    expect(darkKeys).toEqual(lightKeys);
  });
});
