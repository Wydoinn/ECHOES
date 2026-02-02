/**
 * Tests for Landing Screen
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Landing from '../../screens/Landing';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
    playWhoosh: vi.fn(),
  }),
}));

describe('Landing', () => {
  const mockOnEnter = vi.fn();

  beforeEach(() => {
    mockOnEnter.mockClear();
  });

  it('should render the brand name ECHOES', () => {
    render(<Landing onEnter={mockOnEnter} />);

    // Each letter is rendered separately - ECHOES has 2 E's
    const eLetters = screen.getAllByText('E');
    expect(eLetters.length).toBe(2);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('should render the tagline', () => {
    render(<Landing onEnter={mockOnEnter} />);

    expect(screen.getByText('Emotional Alchemy')).toBeInTheDocument();
  });

  it('should render the default greeting', () => {
    render(<Landing onEnter={mockOnEnter} />);

    expect(screen.getByText(/"What have you left unsaid\?"/)).toBeInTheDocument();
  });

  it('should render custom greeting when provided', () => {
    render(<Landing onEnter={mockOnEnter} greeting="Custom greeting message" />);

    expect(screen.getByText(/"Custom greeting message"/)).toBeInTheDocument();
  });

  it('should render the CTA button', () => {
    render(<Landing onEnter={mockOnEnter} />);

    expect(screen.getByText('Begin Your Journey')).toBeInTheDocument();
  });

  it('should call onEnter when CTA button is clicked', () => {
    render(<Landing onEnter={mockOnEnter} />);

    const button = screen.getByText('Begin Your Journey').closest('button');
    if (button) fireEvent.click(button);

    expect(mockOnEnter).toHaveBeenCalledTimes(1);
  });

  it('should work with reducedMotion prop', () => {
    const { container } = render(
      <Landing onEnter={mockOnEnter} reducedMotion={true} />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Begin Your Journey')).toBeInTheDocument();
  });

  it('should have full screen height', () => {
    const { container } = render(<Landing onEnter={mockOnEnter} />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('h-screen');
  });

  it('should center content', () => {
    const { container } = render(<Landing onEnter={mockOnEnter} />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('items-center');
    expect(mainDiv).toHaveClass('justify-center');
  });

  it('should render decorative line elements', () => {
    const { container } = render(<Landing onEnter={mockOnEnter} />);

    // Check for gradient line elements
    const gradientLines = container.querySelectorAll('div[class*="bg-gradient-to-r"]');
    expect(gradientLines.length).toBeGreaterThan(0);
  });

  it('should handle multiple clicks on CTA', () => {
    render(<Landing onEnter={mockOnEnter} />);

    const button = screen.getByText('Begin Your Journey').closest('button');
    if (button) {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    }

    expect(mockOnEnter).toHaveBeenCalledTimes(3);
  });
});
