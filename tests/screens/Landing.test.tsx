/**
 * Tests for Landing Screen
 * Note: i18n mock returns translation keys as-is
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

  it('should render the brand name letters from i18n key', () => {
    render(<Landing onEnter={mockOnEnter} />);

    // i18n mock returns key 'app.name', so letters rendered are a,p,p,.,n,a,m,e
    const container = document.querySelector('.perspective-1000');
    expect(container).toBeInTheDocument();
  });

  it('should render the tagline from i18n', () => {
    render(<Landing onEnter={mockOnEnter} />);

    // i18n mock returns the key as-is
    expect(screen.getByText('app.tagline')).toBeInTheDocument();
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

    // i18n mock returns the key as-is
    expect(screen.getByText('landing.enterButton')).toBeInTheDocument();
  });

  it('should call onEnter when CTA button is clicked', () => {
    render(<Landing onEnter={mockOnEnter} />);

    const button = screen.getByText('landing.enterButton').closest('button');
    if (button) fireEvent.click(button);

    expect(mockOnEnter).toHaveBeenCalledTimes(1);
  });

  it('should work with reducedMotion prop', () => {
    const { container } = render(
      <Landing onEnter={mockOnEnter} reducedMotion={true} />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('landing.enterButton')).toBeInTheDocument();
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

    const button = screen.getByText('landing.enterButton').closest('button');
    if (button) {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    }

    expect(mockOnEnter).toHaveBeenCalledTimes(3);
  });
});
