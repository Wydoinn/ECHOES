/**
 * Tests for EmotionalCanvas screen
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Category } from '../../types';

// Mock child components
vi.mock('../../components/MagneticButton', () => ({
  default: ({ children, onClick, disabled, ...props }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean }>) => (
    <button onClick={onClick} disabled={disabled} data-testid="magnetic-button" {...props}>{children}</button>
  ),
}));

vi.mock('../../components/GuidedJournaling', () => ({
  default: ({ isEnabled, onAddContent }: { isEnabled?: boolean; onAddContent?: (content: string) => void }) => (
    isEnabled ? (
      <div data-testid="guided-journaling">
        <button data-testid="add-content-btn" onClick={() => onAddContent?.('Test content')}>Add Content</button>
      </div>
    ) : null
  ),
}));

vi.mock('../../components/DrawingModal', () => ({
  default: ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: string) => void }) => (
    isOpen ? (
      <div data-testid="drawing-modal">
        <button data-testid="close-drawing" onClick={onClose}>Close</button>
        <button data-testid="save-drawing" onClick={() => onSave('drawing-data')}>Save</button>
      </div>
    ) : null
  ),
}));

vi.mock('../../components/VoiceVisualizer', () => ({
  default: ({ onTranscriptUpdate }: { onTranscriptUpdate?: (text: string) => void }) => (
    <div data-testid="voice-visualizer">
      <button data-testid="update-transcript" onClick={() => onTranscriptUpdate?.('Voice text')}>Update</button>
    </div>
  ),
}));

vi.mock('../../components/TypingBackground', () => ({
  __esModule: true,
  default: React.forwardRef(() => <div data-testid="typing-background" />),
}));

vi.mock('../../components/SentimentIndicator', () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="sentiment-indicator">Sentiment: {text?.length || 0} chars</div>
  ),
}));

vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playType: vi.fn(),
    playClick: vi.fn(),
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

vi.mock('../../utils/draftManager', () => ({
  draftManager: {
    saveDraft: vi.fn(),
    getDraft: vi.fn().mockReturnValue(null),
    getDraftForCategory: vi.fn().mockReturnValue(null),
    deleteDraft: vi.fn(),
    hasDraft: vi.fn().mockReturnValue(false),
  },
  DraftData: {},
}));

vi.mock('../../utils/apiKeyManager', () => ({
  apiKeyManager: {
    hasApiKey: vi.fn().mockReturnValue(true),
    getApiKey: vi.fn().mockReturnValue('test-api-key'),
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
    div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { contentEditable?: boolean | 'true' | 'false' }>(({ children, className, onClick, contentEditable, ...props }, ref) => (
      <div ref={ref} className={className} onClick={onClick} contentEditable={contentEditable} {...props}>{children}</div>
    )),
    textarea: React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
      ({ className, onChange, value, placeholder, ...props }, ref) => (
        <textarea ref={ref} className={className} onChange={onChange} value={value} placeholder={placeholder} {...props} />
      )
    ),
    button: ({ children, className, onClick, disabled, ...props }: React.PropsWithChildren<{ className?: string; onClick?: () => void; disabled?: boolean }>) => (
      <button className={className} onClick={onClick} disabled={disabled} {...props}>{children}</button>
    ),
    span: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <span className={className} {...props}>{children}</span>
    ),
    p: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <p className={className} {...props}>{children}</p>
    ),
    h1: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <h1 className={className} {...props}>{children}</h1>
    ),
    h2: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <h2 className={className} {...props}>{children}</h2>
    ),
    svg: ({ children, ...props }: React.PropsWithChildren<React.SVGProps<SVGSVGElement>>) => (
      <svg {...props}>{children}</svg>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Import after mocking
import EmotionalCanvas from '../../screens/EmotionalCanvas';

describe('EmotionalCanvas', () => {
  const mockOnNext = vi.fn();

  const mockCategory: Category = {
    id: 'grief',
    title: 'Grief',
    description: 'Processing loss',
    icon: '💔',
  };

  const defaultProps = {
    category: mockCategory,
    onNext: mockOnNext,
    reducedMotion: false,
    sentimentIndicatorEnabled: true,
    guidedJournalingEnabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<EmotionalCanvas {...defaultProps} />);
    expect(document.body).toBeTruthy();
  });

  it('should render editable content area for input', () => {
    render(<EmotionalCanvas {...defaultProps} />);
    const editableDiv = document.querySelector('[contenteditable="true"]');
    expect(editableDiv).toBeInTheDocument();
  });

  it('should render the typing background', () => {
    render(<EmotionalCanvas {...defaultProps} />);
    expect(screen.getByTestId('typing-background')).toBeInTheDocument();
  });

  it('should render guided journaling when enabled', () => {
    render(<EmotionalCanvas {...defaultProps} guidedJournalingEnabled={true} />);
    expect(screen.getByTestId('guided-journaling')).toBeInTheDocument();
  });

  it('should not render guided journaling when disabled', () => {
    render(<EmotionalCanvas {...defaultProps} guidedJournalingEnabled={false} />);
    expect(screen.queryByTestId('guided-journaling')).not.toBeInTheDocument();
  });

  it('should render with different categories', () => {
    const categoryIds = ['grief', 'anger', 'anxiety', 'heartbreak', 'regret', 'fear'];

    categoryIds.forEach(id => {
      const category: Category = { id, title: id, description: `Processing ${id}`, icon: '💔' };
      const { unmount } = render(<EmotionalCanvas {...defaultProps} category={category} />);
      expect(document.querySelector('[contenteditable="true"]')).toBeInTheDocument();
      unmount();
    });
  });

  it('should render with reduced motion', () => {
    render(<EmotionalCanvas {...defaultProps} reducedMotion={true} />);
    expect(document.body).toBeTruthy();
  });

  it('should render toolbar buttons', () => {
    render(<EmotionalCanvas {...defaultProps} />);
    const buttons = screen.getAllByTestId('magnetic-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render without initial draft', () => {
    render(<EmotionalCanvas {...defaultProps} initialDraft={null} />);
    expect(document.body).toBeTruthy();
  });
});
