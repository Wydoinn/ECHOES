/**
 * Tests for SafetyRail Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SafetyRail from '../../components/SafetyRail';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
    playTransition: vi.fn(),
  }),
}));

describe('SafetyRail', () => {
  const mockOnProceed = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnProceed.mockClear();
    mockOnCancel.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render gentle reminder heading', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    expect(screen.getByText('A Gentle Reminder')).toBeInTheDocument();
  });

  it('should render disclaimer message', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    expect(screen.getByText(/ECHOES is a creative ritual/i)).toBeInTheDocument();
    expect(screen.getByText(/not a substitute for professional therapy/i)).toBeInTheDocument();
  });

  it('should render continue button', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    expect(screen.getByText(/I Understand, Continue/i)).toBeInTheDocument();
  });

  it('should render go back button', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    expect(screen.getByText(/Go Back/i)).toBeInTheDocument();
  });

  it('should call onProceed when continue button is clicked', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    const continueButton = screen.getByText(/I Understand, Continue/i).closest('button');
    if (continueButton) fireEvent.click(continueButton);

    expect(mockOnProceed).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when go back button is clicked', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText(/Go Back/i);
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Escape key is pressed', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onProceed when Ctrl+Enter is pressed', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });

    expect(mockOnProceed).toHaveBeenCalledTimes(1);
  });

  it('should call onProceed when Meta+Enter is pressed', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'Enter', metaKey: true });

    expect(mockOnProceed).toHaveBeenCalledTimes(1);
  });

  it('should not call onProceed when only Enter is pressed without modifier', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'Enter' });

    expect(mockOnProceed).not.toHaveBeenCalled();
  });

  it('should render plant emoji icon', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    expect(screen.getByText('🌱')).toBeInTheDocument();
  });

  it('should clean up keyboard event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('should display keyboard shortcut hint', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    // jsdom userAgent is not Mac, so Ctrl is shown
    expect(screen.getByText('Ctrl+Enter')).toBeInTheDocument();
  });

  it('should display Esc hint on go back button', () => {
    render(<SafetyRail onProceed={mockOnProceed} onCancel={mockOnCancel} />);

    expect(screen.getByText(/\(Esc\)/)).toBeInTheDocument();
  });
});
