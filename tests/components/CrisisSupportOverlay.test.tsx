/**
 * Tests for CrisisSupportOverlay Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CrisisSupportOverlay from '../../components/CrisisSupportOverlay';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));

describe('CrisisSupportOverlay', () => {
  const mockOnSeekHelp = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnSeekHelp.mockClear();
    mockOnBack.mockClear();
  });

  it('should render the gentle pause heading', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    expect(screen.getByText('A Gentle Pause')).toBeInTheDocument();
  });

  it('should render supportive message', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    expect(screen.getByText(/carrying something incredibly heavy/i)).toBeInTheDocument();
    expect(screen.getByText(/You matter/i)).toBeInTheDocument();
  });

  it('should render seek help button', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    expect(screen.getByText("I'll Seek Help Now")).toBeInTheDocument();
  });

  it('should render find local support link', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    expect(screen.getByText(/Find Local Support/i)).toBeInTheDocument();
  });

  it('should render return to canvas button', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    expect(screen.getByText('Return to canvas')).toBeInTheDocument();
  });

  it('should call onSeekHelp when seek help button is clicked', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    const seekHelpButton = screen.getByText("I'll Seek Help Now").closest('button');
    if (seekHelpButton) fireEvent.click(seekHelpButton);

    expect(mockOnSeekHelp).toHaveBeenCalledTimes(1);
  });

  it('should call onBack when return to canvas is clicked', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    fireEvent.click(screen.getByText('Return to canvas'));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should have link to suicide hotline search', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    const link = screen.getByText(/Find Local Support/i).closest('a');
    expect(link).toHaveAttribute('href', 'https://988lifeline.org');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render warning icon', () => {
    const { container } = render(
      <CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />
    );

    // Check for SVG icon (circle with info)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have backdrop blur styling', () => {
    const { container } = render(
      <CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />
    );

    const overlay = container.firstChild;
    expect(overlay).toHaveClass('backdrop-blur-xl');
  });

  it('should mention professional crisis support', () => {
    render(<CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />);

    expect(screen.getByText(/not a substitute for professional crisis support/i)).toBeInTheDocument();
  });

  it('should be fixed positioned to cover screen', () => {
    const { container } = render(
      <CrisisSupportOverlay onSeekHelp={mockOnSeekHelp} onBack={mockOnBack} />
    );

    const overlay = container.firstChild;
    expect(overlay).toHaveClass('fixed');
    expect(overlay).toHaveClass('inset-0');
    expect(overlay).toHaveClass('z-50');
  });
});
