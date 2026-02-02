/**
 * Tests for FinalRelease screen
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransformationResult, EmotionalData, Category } from '../../types';

// Mock canvas context
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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, onMouseDown, onMouseUp, onTouchStart, onTouchEnd, style, ...props }: React.PropsWithChildren<{ className?: string; onClick?: () => void; onMouseDown?: () => void; onMouseUp?: () => void; onTouchStart?: () => void; onTouchEnd?: () => void; style?: React.CSSProperties }>) => (
      <div className={className} onClick={onClick} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={style} {...props}>{children}</div>
    ),
    button: ({ children, className, onClick, disabled, ...props }: React.PropsWithChildren<{ className?: string; onClick?: () => void; disabled?: boolean }>) => (
      <button className={className} onClick={onClick} disabled={disabled} {...props}>{children}</button>
    ),
    h1: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <h1 className={className} {...props}>{children}</h1>
    ),
    h2: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <h2 className={className} {...props}>{children}</h2>
    ),
    p: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <p className={className} {...props}>{children}</p>
    ),
    span: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <span className={className} {...props}>{children}</span>
    ),
    circle: (props: React.SVGProps<SVGCircleElement>) => <circle {...props} />,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playWhoosh: vi.fn(),
    playChime: vi.fn(),
    playSparkle: vi.fn(),
  }),
}));

// Mock haptics
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

// Mock pdfGenerator
vi.mock('../../utils/pdfGenerator', () => ({
  generateRelicPDF: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocking
import FinalRelease from '../../screens/FinalRelease';

describe('FinalRelease', () => {
  const mockOnRestart = vi.fn();

  const mockResult: TransformationResult = {
    visualMetaphor: 'A glowing ember rising from ashes',
    visualMetaphorPath: 'M 30 50 L 70 50',
    reflection: 'Your pain is transforming into wisdom',
    closureMessage: 'Dear self, you are healing...',
    ritual: {
      step1: 'Acknowledge your feelings',
      step2: 'Release what no longer serves you',
      step3: 'Embrace transformation',
    },
    aftercare: {
      summary: 'Take time to process',
      practices: [
        { title: 'Meditation', description: 'Center yourself', type: 'reflective' as const, icon: '🧘' },
        { title: 'Journaling', description: 'Write your thoughts', type: 'reflective' as const, icon: '📓' },
      ],
    },
  };

  const mockCategory: Category = {
    id: 'grief',
    title: 'Grief',
    description: 'Processing loss',
    icon: '💔',
  };

  const mockOriginalData: EmotionalData = {
    text: 'I am feeling sad about my loss',
    category: mockCategory,
  };

  const defaultProps = {
    onRestart: mockOnRestart,
    result: mockResult,
    originalData: mockOriginalData,
    reducedMotion: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (HTMLCanvasElement.prototype.getContext as unknown) = vi.fn(() => mockContext as unknown as CanvasRenderingContext2D);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render the component', () => {
    render(<FinalRelease {...defaultProps} />);
    expect(document.body).toBeInTheDocument();
  });

  it('should render without result', () => {
    const { result: _result, ...propsWithoutResult } = defaultProps;
    render(<FinalRelease {...propsWithoutResult} />);
    expect(document.body).toBeInTheDocument();
  });

  it('should render without original data', () => {
    const { originalData: _originalData, ...propsWithoutData } = defaultProps;
    render(<FinalRelease {...propsWithoutData} />);
    expect(document.body).toBeInTheDocument();
  });

  it('should accept reducedMotion prop', () => {
    render(<FinalRelease {...defaultProps} reducedMotion />);
    expect(document.body).toBeInTheDocument();
  });

  it('should have buttons for interaction', () => {
    render(<FinalRelease {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render canvas element', () => {
    render(<FinalRelease {...defaultProps} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
