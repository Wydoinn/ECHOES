/**
 * Tests for ParticleSystem component
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ParticleSystem from '../../components/ParticleSystem';

describe('ParticleSystem', () => {
  let mockContext: CanvasRenderingContext2D;
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];

    mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
      shadowBlur: 0,
      shadowColor: '',
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rafCallbacks = [];
  });

  it('should render canvas element', () => {
    const { container } = render(<ParticleSystem />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<ParticleSystem />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.className).toContain('fixed');
    expect(canvas?.className).toContain('inset-0');
    expect(canvas?.className).toContain('pointer-events-none');
    expect(canvas?.className).toContain('z-0');
  });

  it('should set canvas dimensions to window size', () => {
    const { container } = render(<ParticleSystem />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;

    expect(canvas.width).toBe(window.innerWidth);
    expect(canvas.height).toBe(window.innerHeight);
  });

  it('should request animation frame on mount', () => {
    render(<ParticleSystem />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should get 2d context from canvas', () => {
    render(<ParticleSystem />);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
  });

  it('should draw particles using clearRect', () => {
    render(<ParticleSystem />);

    // Trigger animation frame
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should draw star particles', () => {
    render(<ParticleSystem />);

    // Trigger animation frame
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.fill).toHaveBeenCalled();
  });

  it('should use default color when no color prop provided', () => {
    render(<ParticleSystem />);

    // Trigger animation frame
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    // Default color is "230, 210, 255"
    expect(mockContext.fillStyle).toMatch(/rgba\(230, 210, 255,/);
  });

  it('should use custom color when provided', () => {
    render(<ParticleSystem color="255, 100, 50" />);

    // Trigger animation frame
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    expect(mockContext.fillStyle).toMatch(/rgba\(255, 100, 50,/);
  });

  it('should handle window resize', () => {
    const { container } = render(<ParticleSystem />);

    // Simulate resize
    window.innerWidth = 1920;
    window.innerHeight = 1080;

    act(() => {
      fireEvent(window, new Event('resize'));
    });

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
  });

  it('should track mouse position', () => {
    render(<ParticleSystem />);

    act(() => {
      fireEvent.mouseMove(window, { clientX: 500, clientY: 300 });
    });

    // Trigger animation frame to use mouse position
    if (rafCallbacks.length > 0) {
      act(() => {
        rafCallbacks[0](0);
      });
    }

    // Should not throw
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ParticleSystem />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('should handle null canvas ref', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    // Should not throw
    expect(() => render(<ParticleSystem />)).not.toThrow();
  });
});
