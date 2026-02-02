/**
 * Tests for ProcessingScreen
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Category, EmotionalData } from '../../types';

// Mock canvas context for AlchemicalVortex
const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
};

// Mock child components
vi.mock('../../components/AlchemicalVortex', () => ({
  default: ({ phase }: { phase: string }) => (
    <div data-testid="alchemical-vortex">Phase: {phase}</div>
  ),
}));

vi.mock('../../components/MagneticButton', () => ({
  default: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <button onClick={onClick} data-testid="magnetic-button" {...props}>{children}</button>
  ),
}));

vi.mock('../../components/CrisisSupportOverlay', () => ({
  default: ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => (
    isVisible ? <div data-testid="crisis-overlay"><button onClick={onClose}>Close</button></div> : null
  ),
}));

vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playWhoosh: vi.fn(),
    playSparkle: vi.fn(),
    playChime: vi.fn(),
  }),
}));

vi.mock('../../utils/haptics', () => ({
  haptics: {
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
    transformation: vi.fn(),
    chime: vi.fn(),
    impact: vi.fn(),
  },
}));

vi.mock('../../utils/timeAwareness', () => ({
  getTimeContext: vi.fn().mockReturnValue({
    timeOfDay: 'afternoon',
    greeting: 'Good afternoon',
  }),
}));

vi.mock('../../utils/sessionMemory', () => ({
  sessionMemory: {
    addSession: vi.fn(),
    save: vi.fn(),
    getSessions: vi.fn().mockReturnValue([]),
    getHistory: vi.fn().mockReturnValue([]),
    getInsight: vi.fn().mockReturnValue(null),
  },
}));

vi.mock('../../utils/apiKeyManager', () => ({
  apiKeyManager: {
    hasApiKey: vi.fn().mockReturnValue(true),
    getApiKey: vi.fn().mockReturnValue('test-api-key'),
  },
}));

vi.mock('../../utils/demoData', () => ({
  DEMO_RESULT: {
    visualMetaphor: 'A glowing ember',
    visualMetaphorPath: 'M 30 50 L 70 50',
    transformationNarrative: 'Your pain is transforming',
    actionableStep: 'Take a deep breath',
    tone: 'supportive',
    closureLetter: 'Dear self...',
    ritualSteps: [{ title: 'Step 1', description: 'Breathe' }],
    aftercare: {
      practices: ['Meditation'],
      reminders: ['You are strong'],
      resources: [],
    },
  },
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: 'test response',
      }),
    },
  })),
  Type: {
    STRING: 'STRING',
    ARRAY: 'ARRAY',
    OBJECT: 'OBJECT',
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} {...props}>{children}</div>
    ),
    p: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <p className={className} {...props}>{children}</p>
    ),
    button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void }>) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Import after mocking
import ProcessingScreen from '../../screens/ProcessingScreen';

describe('ProcessingScreen', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnRestart = vi.fn();

  const mockCategory: Category = {
    id: 'grief',
    title: 'Grief',
    description: 'Processing loss',
    icon: '💔',
  };

  const mockEmotionalData: EmotionalData = {
    text: 'I am feeling sad about losing my friend.',
    category: mockCategory,
  };

  const defaultProps = {
    data: mockEmotionalData,
    onComplete: mockOnComplete,
    onCancel: mockOnCancel,
    onRestart: mockOnRestart,
    isDemoMode: false,
    reducedMotion: false,
    aiResponseStyle: 'poetic' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (HTMLCanvasElement.prototype.getContext as unknown) = vi.fn(() => mockContext as unknown as CanvasRenderingContext2D);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the alchemical vortex', () => {
    render(<ProcessingScreen {...defaultProps} />);
    expect(screen.getByTestId('alchemical-vortex')).toBeInTheDocument();
  });

  it('should start with shatter phase', () => {
    render(<ProcessingScreen {...defaultProps} />);
    expect(screen.getByText(/Phase: shatter/i)).toBeInTheDocument();
  });

  it('should render with reduced motion', () => {
    render(<ProcessingScreen {...defaultProps} reducedMotion isDemoMode />);
    // When reducedMotion is true, AlchemicalVortex is not rendered
    expect(screen.queryByTestId('alchemical-vortex')).not.toBeInTheDocument();
    // But the demo mode indicator should still be present
    expect(screen.getByText(/Demo Mode Active/i)).toBeInTheDocument();
  });

  it('should handle demo mode', () => {
    render(<ProcessingScreen {...defaultProps} isDemoMode />);
    expect(screen.getByTestId('alchemical-vortex')).toBeInTheDocument();
  });

  it('should handle different categories', () => {
    const categoryIds = ['grief', 'anger', 'anxiety', 'heartbreak', 'regret', 'fear'];

    categoryIds.forEach(id => {
      const category: Category = { id, title: id, description: `Processing ${id}`, icon: '💔' };
      const data = { ...mockEmotionalData, category };
      const { unmount } = render(<ProcessingScreen {...defaultProps} data={data} />);
      expect(screen.getByTestId('alchemical-vortex')).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle different AI response styles', () => {
    const styles: Array<'poetic' | 'direct' | 'therapeutic' | 'spiritual'> = ['poetic', 'direct', 'therapeutic', 'spiritual'];

    styles.forEach(style => {
      const { unmount } = render(<ProcessingScreen {...defaultProps} aiResponseStyle={style} />);
      expect(screen.getByTestId('alchemical-vortex')).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle escape key to cancel', () => {
    render(<ProcessingScreen {...defaultProps} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
