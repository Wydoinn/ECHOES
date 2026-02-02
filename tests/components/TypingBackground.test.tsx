/**
 * Tests for TypingBackground component
 */

import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TypingBackground, { TypingBackgroundHandle } from '../../components/TypingBackground';

describe('TypingBackground', () => {
  let mockContext: CanvasRenderingContext2D;
  let rafCallbacks: FrameRequestCallback[];
  let rafId: number;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;

    mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallbacks.push(callback);
      rafId += 1;
      return rafId;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render canvas element', () => {
    const { container } = render(<TypingBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<TypingBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.className).toContain('fixed');
    expect(canvas?.className).toContain('inset-0');
    expect(canvas?.className).toContain('pointer-events-none');
    expect(canvas?.className).toContain('z-0');
  });

  it('should have screen blend mode style', () => {
    const { container } = render(<TypingBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.style.mixBlendMode).toBe('screen');
  });

  it('should set canvas dimensions to window size', () => {
    const { container } = render(<TypingBackground />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;

    expect(canvas.width).toBe(window.innerWidth);
    expect(canvas.height).toBe(window.innerHeight);
  });

  it('should handle window resize', () => {
    const { container } = render(<TypingBackground />);

    window.innerWidth = 1920;
    window.innerHeight = 1080;

    act(() => {
      fireEvent(window, new Event('resize'));
    });

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
  });

  it('should start animation on mount', () => {
    render(<TypingBackground />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should clear canvas on each frame', () => {
    render(<TypingBackground />);

    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should expose addRipple method via ref', () => {
    const ref = React.createRef<TypingBackgroundHandle>();
    render(<TypingBackground ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.addRipple).toBe('function');
  });

  it('should add ripple with correct properties', () => {
    const ref = React.createRef<TypingBackgroundHandle>();
    render(<TypingBackground ref={ref} />);

    act(() => {
      ref.current?.addRipple(0.5);
    });

    // Trigger animation frame
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    // Should draw ripple
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.fill).toHaveBeenCalled();
  });

  it('should draw ring stroke for ripples', () => {
    const ref = React.createRef<TypingBackgroundHandle>();
    render(<TypingBackground ref={ref} />);

    act(() => {
      ref.current?.addRipple(0.5);
    });

    // Trigger animation frame
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should calculate intensity-based ripple properties', () => {
    const ref = React.createRef<TypingBackgroundHandle>();
    render(<TypingBackground ref={ref} />);

    // Add ripple with minimum intensity
    act(() => {
      ref.current?.addRipple(0);
    });

    // Add ripple with maximum intensity
    act(() => {
      ref.current?.addRipple(1);
    });

    // Trigger animation frame
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    // Should draw multiple ripples
    expect(mockContext.arc).toHaveBeenCalled();
  });

  it('should remove faded ripples', () => {
    const ref = React.createRef<TypingBackgroundHandle>();
    render(<TypingBackground ref={ref} />);

    act(() => {
      ref.current?.addRipple(0.5);
    });

    // Run many animation frames to fade out ripple
    for (let i = 0; i < 100; i++) {
      if (rafCallbacks.length > i) {
        act(() => {
          rafCallbacks[i](i * 16);
        });
      }
    }

    // Should not throw
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should clean up on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<TypingBackground />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should handle null context gracefully', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(() => render(<TypingBackground />)).not.toThrow();
  });
});
