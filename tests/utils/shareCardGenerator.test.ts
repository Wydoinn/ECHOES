/**
 * Tests for shareCardGenerator utility
 */

import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { TransformationResult } from '../../types';

// Mock Path2D which doesn't exist in jsdom
class MockPath2D {
  constructor(public path?: string) {}
}
(global as Record<string, unknown>).Path2D = MockPath2D;

// Helper to create a valid TransformationResult for tests
function createMockResult(overrides: Partial<TransformationResult> = {}): TransformationResult {
  return {
    visualMetaphor: 'A glowing ember',
    visualMetaphorPath: 'M 30 50 C 30 20 70 20 70 50 Z',
    reflection: 'Your journey has transformed...',
    closureMessage: 'Take a moment to breathe.',
    ritual: {
      step1: 'Acknowledge your feelings',
      step2: 'Release what no longer serves you',
      step3: 'Embrace transformation',
    },
    aftercare: {
      summary: 'Be gentle with yourself',
      practices: [
        { title: 'Meditation', description: 'Center yourself', type: 'reflective', icon: '🧘' },
      ],
    },
    ...overrides,
  };
}

describe('shareCardGenerator', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let createElementSpy: MockInstance;
  let appendChildSpy: MockInstance;
  let removeChildSpy: MockInstance;

  beforeEach(() => {
    mockContext = {
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      fillStyle: '',
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      shadowColor: '',
      shadowBlur: 0,
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: '',
      stroke: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 100 }),
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    } as unknown as HTMLCanvasElement;

    const mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
    };

    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas;
      if (tag === 'a') return mockLink as unknown as HTMLAnchorElement;
      return document.createElement(tag);
    });

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.clearAllMocks();
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should create a canvas element', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    expect(createElementSpy).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.width).toBe(1080);
    expect(mockCanvas.height).toBe(1080);
  });

  it('should get 2d context', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should draw background gradient', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    expect(mockContext.createLinearGradient).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 1080, 1080);
  });

  it('should draw ECHOES branding', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    expect(mockContext.fillText).toHaveBeenCalledWith('E C H O E S', expect.any(Number), expect.any(Number));
  });

  it('should draw the visual metaphor text', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    // Should have called fillText for the quote (word wrapped)
    expect(mockContext.fillText).toHaveBeenCalled();
  });

  it('should export canvas as PNG', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
  });

  it('should create download link', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('should return early if no context is available', async () => {
    mockCanvas.getContext = vi.fn().mockReturnValue(null);
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await generateShareCard(result);

    expect(mockContext.fillRect).not.toHaveBeenCalled();
  });

  it('should use default path if none provided', async () => {
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult({ visualMetaphorPath: undefined });

    await generateShareCard(result);

    // Should still complete without error
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should handle export errors gracefully', async () => {
    mockCanvas.toDataURL = vi.fn().mockImplementation(() => {
      throw new Error('Export failed');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { generateShareCard } = await import('../../utils/shareCardGenerator');

    const result = createMockResult();

    await expect(generateShareCard(result)).rejects.toThrow('Failed to generate share card. Please try again.');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to generate share card:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
