/**
 * Tests for MagneticButton Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MagneticButton from '../../components/MagneticButton';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));

describe('MagneticButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <MagneticButton>
        <span>Button Text</span>
      </MagneticButton>
    );

    expect(screen.getByText('Button Text')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <MagneticButton onClick={onClick}>
        Click Me
      </MagneticButton>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(
      <MagneticButton className="custom-class">
        Styled Button
      </MagneticButton>
    );

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should render with active state styling', () => {
    render(
      <MagneticButton active={true}>
        Active Button
      </MagneticButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-[#d4af37]/10');
  });

  it('should render with inactive state styling', () => {
    render(
      <MagneticButton active={false}>
        Inactive Button
      </MagneticButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-[rgba(255,255,255,0.05)]');
  });

  it('should render keyboard shortcut tooltip when provided', () => {
    render(
      <MagneticButton shortcut="⌘+K">
        With Shortcut
      </MagneticButton>
    );

    expect(screen.getByText('⌘+K')).toBeInTheDocument();
  });

  it('should not render shortcut tooltip when not provided', () => {
    render(
      <MagneticButton>
        No Shortcut
      </MagneticButton>
    );

    expect(screen.queryByText('⌘+K')).not.toBeInTheDocument();
  });

  it('should have data-hoverable attribute', () => {
    render(
      <MagneticButton>
        Hoverable
      </MagneticButton>
    );

    expect(screen.getByRole('button')).toHaveAttribute('data-hoverable', 'true');
  });

  it('should handle mouse move events', () => {
    render(
      <MagneticButton>
        Mouse Move
      </MagneticButton>
    );

    const button = screen.getByRole('button');

    // Should not throw on mouse move
    fireEvent.mouseMove(button, { clientX: 100, clientY: 100 });
    expect(button).toBeInTheDocument();
  });

  it('should handle mouse leave events', () => {
    render(
      <MagneticButton>
        Mouse Leave
      </MagneticButton>
    );

    const button = screen.getByRole('button');

    fireEvent.mouseLeave(button);
    expect(button).toBeInTheDocument();
  });

  it('should handle mouse enter events', () => {
    render(
      <MagneticButton>
        Mouse Enter
      </MagneticButton>
    );

    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);
    expect(button).toBeInTheDocument();
  });

  it('should work with reducedMotion prop', () => {
    render(
      <MagneticButton reducedMotion={true}>
        Reduced Motion
      </MagneticButton>
    );

    const button = screen.getByRole('button');

    // Should still work with mouse events when reducedMotion is true
    fireEvent.mouseMove(button, { clientX: 100, clientY: 100 });
    expect(button).toBeInTheDocument();
  });

  it('should render multiple children elements', () => {
    render(
      <MagneticButton>
        <span data-testid="icon">🔥</span>
        <span data-testid="text">Fire</span>
      </MagneticButton>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('text')).toBeInTheDocument();
  });

  it('should be focusable', () => {
    render(
      <MagneticButton>
        Focusable
      </MagneticButton>
    );

    const button = screen.getByRole('button');
    button.focus();

    expect(document.activeElement).toBe(button);
  });
});
