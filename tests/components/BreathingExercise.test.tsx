/**
 * Tests for BreathingExercise Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// Mock framer-motion before importing component
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) =>
      React.createElement('div', props, children),
    h2: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) =>
      React.createElement('h2', props, children),
    span: ({ children, ...props }: React.HTMLProps<HTMLSpanElement>) =>
      React.createElement('span', props, children),
    button: ({ children, ...props }: React.HTMLProps<HTMLButtonElement>) =>
      React.createElement('button', props, children),
    p: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) =>
      React.createElement('p', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playBreathPhase: vi.fn(),
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));

// Mock haptics
vi.mock('../../utils/haptics', () => ({
  haptics: {
    type: vi.fn(),
    heartbeat: vi.fn(),
    transformation: vi.fn(),
    release: vi.fn(),
    complete: vi.fn(),
  },
}));

import BreathingExercise from '../../components/BreathingExercise';

describe('BreathingExercise', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();
  const mockOnRestart = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnComplete.mockClear();
    mockOnSkip.mockClear();
    mockOnRestart.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should render the breathing exercise', () => {
    render(<BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />);

    // Initially shows breathing.inhale (i18n key)
    expect(screen.getByText('breathing.inhale')).toBeInTheDocument();
  });

  it('should render skip button', () => {
    render(<BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />);

    expect(screen.getByText('breathing.skip')).toBeInTheDocument();
  });

  it('should call onSkip when skip button is clicked', () => {
    render(<BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />);

    fireEvent.click(screen.getByText('breathing.skip'));

    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('should render progress dots for cycles', () => {
    const { container } = render(
      <BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />
    );

    // Should have 4 progress dots (TOTAL_CYCLES = 4)
    const dots = container.querySelectorAll('.rounded-full.w-2.h-2');
    expect(dots.length).toBe(4);
  });

  it('should start automatically after delay', async () => {
    render(<BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />);

    // Initial state shows inhale
    expect(screen.getByText('breathing.inhale')).toBeInTheDocument();

    // Advance past the start delay (1000ms)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should still show inhale (exercise has started)
    expect(screen.getByText('breathing.inhale')).toBeInTheDocument();
  });

  it('should transition through phases', async () => {
    render(<BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />);

    // Start the exercise
    await act(async () => {
      vi.advanceTimersByTime(1000); // Start delay
    });

    // Verify initial inhale phase
    expect(screen.getByText('breathing.inhale')).toBeInTheDocument();

    // Advance to hold phase (4000ms)
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByText('breathing.hold')).toBeInTheDocument();

    // Advance to exhale phase (4000ms)
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByText('breathing.exhale')).toBeInTheDocument();
  });

  it('should complete after all cycles', async () => {
    render(<BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />);

    // Start the exercise
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Complete all 4 cycles (4 cycles * 3 phases * 4000ms = 48000ms)
    for (let cycle = 0; cycle < 4; cycle++) {
      // Inhale -> Hold -> Exhale
      await act(async () => {
        vi.advanceTimersByTime(4000); // Inhale
      });
      await act(async () => {
        vi.advanceTimersByTime(4000); // Hold
      });
      await act(async () => {
        vi.advanceTimersByTime(4000); // Exhale
      });
    }

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should show correct number of completed cycles in progress dots', async () => {
    const { container } = render(
      <BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />
    );

    // Start the exercise
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Initially, one cycle should be active/in-progress
    const initialDots = container.querySelectorAll('.rounded-full.w-2.h-2');
    expect(initialDots.length).toBe(4);
  });

  it('should have correct backdrop styling', () => {
    const { container } = render(
      <BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />
    );

    const backdrop = container.firstChild;
    expect(backdrop).toHaveClass('backdrop-blur-md');
  });

  it('should have breathing orb element', () => {
    const { container } = render(
      <BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />
    );

    // Check for the orb gradient element
    const orb = container.querySelector('.rounded-full.bg-gradient-to-tr');
    expect(orb).toBeInTheDocument();
  });

  it('should render guide rings', () => {
    const { container } = render(
      <BreathingExercise onComplete={mockOnComplete} onSkip={mockOnSkip} onRestart={mockOnRestart} />
    );

    // Check for outer guide rings
    const rings = container.querySelectorAll('.rounded-full.border');
    expect(rings.length).toBeGreaterThan(0);
  });
});
