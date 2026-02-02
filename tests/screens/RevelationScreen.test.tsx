/**
 * Tests for RevelationScreen screen
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransformationResult, EmotionalData, Category } from '../../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
      <div className={className} onClick={onClick} {...props}>{children}</div>
    ),
    section: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <section className={className} {...props}>{children}</section>
    ),
    span: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <span className={className} {...props}>{children}</span>
    ),
    button: ({ children, className, onClick, ...props }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
      <button className={className} onClick={onClick} {...props}>{children}</button>
    ),
    p: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <p className={className} {...props}>{children}</p>
    ),
    h2: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <h2 className={className} {...props}>{children}</h2>
    ),
    path: ({ d, ...props }: React.SVGProps<SVGPathElement>) => <path d={d} {...props} />,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useAnimation: vi.fn().mockReturnValue({ start: vi.fn() }),
  useInView: vi.fn().mockReturnValue(true),
}));

// Mock child components
vi.mock('../../components/VisualMetaphor', () => ({
  default: ({ description, onShare }: { description?: string; onShare?: () => void }) => (
    <div data-testid="visual-metaphor">
      <span>{description}</span>
      {onShare && <button data-testid="share-btn" onClick={onShare}>Share</button>}
    </div>
  ),
}));

vi.mock('../../components/Reflection', () => ({
  default: ({ text, onOpenLetter }: { text?: string; onOpenLetter?: () => void }) => (
    <div data-testid="reflection">
      <span>{text}</span>
      {onOpenLetter && <button data-testid="open-letter" onClick={onOpenLetter}>Open Letter</button>}
    </div>
  ),
}));

vi.mock('../../components/ClosureLetter', () => ({
  default: ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message?: string }) => (
    isOpen ? (
      <div data-testid="closure-letter">
        <span>{message}</span>
        <button data-testid="close-letter" onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

vi.mock('../../components/TransformationRitual', () => ({
  default: ({ steps }: { steps?: object[] }) => (
    <div data-testid="transformation-ritual">
      {steps?.length} steps
    </div>
  ),
}));

vi.mock('../../components/AftercareKit', () => ({
  default: ({ data: _data }: { data?: object }) => (
    <div data-testid="aftercare-kit">Aftercare</div>
  ),
}));

vi.mock('../../components/FinalRelease', () => ({
  default: ({ onRestart }: { onRestart: () => void }) => (
    <div data-testid="final-release">
      <button data-testid="restart-btn" onClick={onRestart}>Restart</button>
    </div>
  ),
}));

vi.mock('../../components/AudioEmotionMirror', () => ({
  default: ({ insight: _insight }: { insight?: object }) => (
    <div data-testid="audio-mirror">Audio Insight</div>
  ),
}));

vi.mock('../../components/EmotionalArcGraph', () => ({
  default: ({ arc: _arc }: { arc?: object[] }) => (
    <div data-testid="emotional-arc">Emotional Arc</div>
  ),
}));

vi.mock('../../components/AmbientPlayer', () => ({
  default: ({ emotion }: { emotion?: string }) => (
    <div data-testid="ambient-player">{emotion}</div>
  ),
}));

vi.mock('../../utils/shareCardGenerator', () => ({
  generateShareCard: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks
import RevelationScreen from '../../screens/RevelationScreen';
import { generateShareCard } from '../../utils/shareCardGenerator';

describe('RevelationScreen', () => {
  const mockCategory: Category = {
    id: 'heartbreak',
    title: 'Heartbreak',
    description: 'Processing loss',
    icon: '💔',
  };

  const mockResult: TransformationResult = {
    visualMetaphor: 'A phoenix rising',
    visualMetaphorPath: 'M 10 20 L 30 40',
    reflection: 'You have grown stronger',
    closureMessage: 'Remember your strength',
    ritual: {
      step1: 'Breathe deeply',
      step2: 'Release tension',
      step3: 'Embrace peace',
    },
    aftercare: {
      summary: 'You are strong',
      practices: [
        { title: 'Meditation', description: 'Center yourself', type: 'reflective' as const, icon: '🧘' },
      ],
    },
  };

  const mockOriginalData: EmotionalData = {
    category: mockCategory,
    text: 'I feel sad',
  };

  const defaultProps = {
    result: mockResult,
    originalData: mockOriginalData,
    onRestart: vi.fn(),
    reducedMotion: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render visual metaphor section', () => {
    render(<RevelationScreen {...defaultProps} />);
    expect(screen.getByTestId('visual-metaphor')).toBeInTheDocument();
    expect(screen.getByText('A phoenix rising')).toBeInTheDocument();
  });

  it('should render reflection section', () => {
    render(<RevelationScreen {...defaultProps} />);
    expect(screen.getByTestId('reflection')).toBeInTheDocument();
    expect(screen.getByText('You have grown stronger')).toBeInTheDocument();
  });

  it('should render transformation ritual', () => {
    render(<RevelationScreen {...defaultProps} />);
    expect(screen.getByTestId('transformation-ritual')).toBeInTheDocument();
  });

  it('should render aftercare kit when provided', () => {
    render(<RevelationScreen {...defaultProps} />);
    expect(screen.getByTestId('aftercare-kit')).toBeInTheDocument();
  });

  it('should not render aftercare kit when not provided', () => {
    const resultWithoutAftercare = {
      ...mockResult,
      aftercare: undefined as unknown as typeof mockResult.aftercare,
    };
    const propsWithoutAftercare = {
      ...defaultProps,
      result: resultWithoutAftercare as TransformationResult,
    };
    render(<RevelationScreen {...propsWithoutAftercare} />);
    expect(screen.queryByTestId('aftercare-kit')).not.toBeInTheDocument();
  });

  it('should render final release section', () => {
    render(<RevelationScreen {...defaultProps} />);
    expect(screen.getByTestId('final-release')).toBeInTheDocument();
  });

  it('should render ambient player', () => {
    render(<RevelationScreen {...defaultProps} />);
    expect(screen.getByTestId('ambient-player')).toBeInTheDocument();
  });

  it('should call onRestart when restart button clicked', () => {
    render(<RevelationScreen {...defaultProps} />);
    fireEvent.click(screen.getByTestId('restart-btn'));
    expect(defaultProps.onRestart).toHaveBeenCalledTimes(1);
  });

  it('should open closure letter when open letter clicked', () => {
    render(<RevelationScreen {...defaultProps} />);

    expect(screen.queryByTestId('closure-letter')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('open-letter'));

    expect(screen.getByTestId('closure-letter')).toBeInTheDocument();
    expect(screen.getByText('Remember your strength')).toBeInTheDocument();
  });

  it('should close closure letter when close button clicked', () => {
    render(<RevelationScreen {...defaultProps} />);

    fireEvent.click(screen.getByTestId('open-letter'));
    expect(screen.getByTestId('closure-letter')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-letter'));

    // The closure letter should be closed
    expect(screen.queryByTestId('closure-letter')).not.toBeInTheDocument();
  });

  it('should call generateShareCard when share clicked', () => {
    render(<RevelationScreen {...defaultProps} />);

    fireEvent.click(screen.getByTestId('share-btn'));

    expect(generateShareCard).toHaveBeenCalledWith(mockResult);
  });

  it('should render audio insight when provided', () => {
    const propsWithAudioInsight = {
      ...defaultProps,
      result: {
        ...mockResult,
        audioInsight: {
          toneSummary: 'calm',
          wordSummary: 'Peaceful',
          suggestedLabel: 'Serene',
        },
      },
    };
    render(<RevelationScreen {...propsWithAudioInsight} />);
    expect(screen.getByTestId('audio-mirror')).toBeInTheDocument();
  });

  it('should render emotional arc when provided', () => {
    const propsWithArc = {
      ...defaultProps,
      result: {
        ...mockResult,
        emotionalArc: {
          segments: [
            { text: 'Start', sentiment: 0.8, label: 'Hopeful' },
            { text: 'End', sentiment: 0.3, label: 'Calm' },
          ],
          overallArc: 'cathartic-release',
          narrativeSummary: 'A journey from tension to peace',
        },
      },
    };
    render(<RevelationScreen {...propsWithArc} />);
    expect(screen.getByTestId('emotional-arc')).toBeInTheDocument();
  });

  it('should not render insights section when no audio insight or arc', () => {
    const propsWithoutInsights = {
      ...defaultProps,
      result: {
        ...mockResult,
        audioInsight: undefined,
        emotionalArc: undefined,
      },
    };
    render(<RevelationScreen {...propsWithoutInsights} />);
    expect(screen.queryByTestId('audio-mirror')).not.toBeInTheDocument();
    expect(screen.queryByTestId('emotional-arc')).not.toBeInTheDocument();
  });

  it('should render scroll indicator', () => {
    render(<RevelationScreen {...defaultProps} />);
    expect(screen.getByText('Scroll to Reflect')).toBeInTheDocument();
  });

  it('should pass reducedMotion to child components', () => {
    render(<RevelationScreen {...defaultProps} reducedMotion />);
    // Should render without errors
    expect(screen.getByTestId('visual-metaphor')).toBeInTheDocument();
  });
});
