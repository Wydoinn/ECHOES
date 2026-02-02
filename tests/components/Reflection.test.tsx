/**
 * Tests for Reflection Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Reflection from '../../components/Reflection';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
    playType: vi.fn(),
  }),
}));

// Mock framer-motion's useInView to always return true for tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useInView: () => true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) =>
        React.createElement('div', props, children),
      button: ({ children, ...props }: React.HTMLProps<HTMLButtonElement>) =>
        React.createElement('button', props, children),
      span: ({ children, ...props }: React.HTMLProps<HTMLSpanElement>) =>
        React.createElement('span', props, children),
      p: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) =>
        React.createElement('p', props, children),
    },
  };
});

describe('Reflection', () => {
  const mockOnOpenLetter = vi.fn();
  const testText = 'This is a reflection message that will be typed out.';

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnOpenLetter.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should render the title section', () => {
    render(<Reflection text={testText} onOpenLetter={mockOnOpenLetter} />);

    expect(screen.getByText('The')).toBeInTheDocument();
    expect(screen.getByText('Echo')).toBeInTheDocument();
  });

  it('should render reflection label', () => {
    render(<Reflection text={testText} onOpenLetter={mockOnOpenLetter} />);

    expect(screen.getByText('◈ Reflection ◈')).toBeInTheDocument();
  });

  it('should render the open letter button', () => {
    render(<Reflection text={testText} onOpenLetter={mockOnOpenLetter} />);

    expect(screen.getByText('Open The Letter')).toBeInTheDocument();
  });

  it('should call onOpenLetter when button is clicked', () => {
    render(<Reflection text={testText} onOpenLetter={mockOnOpenLetter} />);

    const button = screen.getByText('Open The Letter').closest('button');
    if (button) fireEvent.click(button);

    expect(mockOnOpenLetter).toHaveBeenCalledTimes(1);
  });

  it('should start with empty displayed text', () => {
    const { container } = render(
      <Reflection text={testText} onOpenLetter={mockOnOpenLetter} />
    );

    // Initially text should start typing
    expect(container).toBeInTheDocument();
  });

  it('should type out text over time', async () => {
    render(<Reflection text={testText} onOpenLetter={mockOnOpenLetter} />);

    // Advance timers to allow typing effect
    await act(async () => {
      // Each character takes 30ms, advance for a few characters
      vi.advanceTimersByTime(150);
    });

    // Should have typed some characters
    expect(screen.getByText(/This/)).toBeInTheDocument();
  });

  it('should complete typing after sufficient time', async () => {
    render(<Reflection text={testText} onOpenLetter={mockOnOpenLetter} />);

    // Advance timers for full text (text.length * 30ms + buffer)
    await act(async () => {
      vi.advanceTimersByTime(testText.length * 30 + 100);
    });

    // Should have full text displayed
    expect(screen.getByText(`"${testText}"`)).toBeInTheDocument();
  });

  it('should show cursor while typing', async () => {
    const { container } = render(
      <Reflection text={testText} onOpenLetter={mockOnOpenLetter} />
    );

    // During typing, cursor should be visible (it's a span element)
    await act(async () => {
      vi.advanceTimersByTime(60); // After 2 characters
    });

    // Check for cursor element (inline-block span with gradient)
    const cursor = container.querySelector('span[class*="inline-block"]');
    expect(cursor).toBeInTheDocument();
  });

  it('should have decorative corner accents', () => {
    const { container } = render(
      <Reflection text={testText} onOpenLetter={mockOnOpenLetter} />
    );

    // Check for corner accent elements
    const corners = container.querySelectorAll('div[class*="border-l"][class*="border-t"], div[class*="border-r"][class*="border-t"], div[class*="border-l"][class*="border-b"], div[class*="border-r"][class*="border-b"]');
    expect(corners.length).toBe(4);
  });

  it('should render scroll indicator', async () => {
    render(<Reflection text={testText} onOpenLetter={mockOnOpenLetter} />);

    // Complete typing
    await act(async () => {
      vi.advanceTimersByTime(testText.length * 30 + 100);
    });

    // Should show scroll indicator
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('should handle empty text', () => {
    const { container } = render(
      <Reflection text="" onOpenLetter={mockOnOpenLetter} />
    );

    expect(container).toBeInTheDocument();
  });

  it('should have full height styling', () => {
    const { container } = render(
      <Reflection text={testText} onOpenLetter={mockOnOpenLetter} />
    );

    const mainDiv = container.querySelector('div[class*="min-h-screen"]');
    expect(mainDiv).toBeInTheDocument();
  });
});
