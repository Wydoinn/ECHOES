/**
 * Tests for AlchemicalVortex component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AlchemicalVortex from '../../components/AlchemicalVortex';

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
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
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

describe('AlchemicalVortex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock canvas getContext
    (HTMLCanvasElement.prototype.getContext as unknown) = vi.fn(() => mockContext as unknown as CanvasRenderingContext2D);
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((_cb) => {
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render a canvas element', () => {
    render(<AlchemicalVortex phase="shatter" />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('fixed', 'inset-0', 'z-0', 'pointer-events-none');
  });

  it('should render with shatter phase', () => {
    render(<AlchemicalVortex phase="shatter" />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with vortex phase', () => {
    render(<AlchemicalVortex phase="vortex" />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with coalesce phase', () => {
    render(<AlchemicalVortex phase="coalesce" />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with orb phase', () => {
    render(<AlchemicalVortex phase="orb" />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with reduced motion enabled', () => {
    render(<AlchemicalVortex phase="shatter" reducedMotion />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should handle phase change', () => {
    const { rerender } = render(<AlchemicalVortex phase="shatter" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();

    rerender(<AlchemicalVortex phase="vortex" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();

    rerender(<AlchemicalVortex phase="orb" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('should initialize canvas context', () => {
    render(<AlchemicalVortex phase="shatter" />);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
  });
});
