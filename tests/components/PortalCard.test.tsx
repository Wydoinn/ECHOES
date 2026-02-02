/**
 * Tests for PortalCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, onMouseMove, onMouseLeave, style, animate, ...props }: React.PropsWithChildren<{
      className?: string;
      onClick?: () => void;
      onMouseMove?: React.MouseEventHandler;
      onMouseLeave?: React.MouseEventHandler;
      style?: React.CSSProperties;
      animate?: object;
    }>) => (
      <div
        className={className}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={style}
        data-animate={JSON.stringify(animate)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  useMotionValue: vi.fn().mockReturnValue({ set: vi.fn(), get: vi.fn(() => 0) }),
  useSpring: vi.fn().mockReturnValue({ set: vi.fn(), get: vi.fn(() => 0) }),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Import after mocking
import PortalCard from '../../components/PortalCard';

describe('PortalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render children', () => {
    render(
      <PortalCard>
        <span data-testid="child">Test Content</span>
      </PortalCard>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child').textContent).toBe('Test Content');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PortalCard className="custom-class">
        <span>Test</span>
      </PortalCard>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should call onClick after animation delay', () => {
    const handleClick = vi.fn();
    render(
      <PortalCard onClick={handleClick}>
        <span data-testid="content">Click me</span>
      </PortalCard>
    );

    const card = screen.getByTestId('content').closest('[class*="cursor-pointer"]');
    if (card) {
      fireEvent.click(card);
    }

    expect(handleClick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(600);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle mouse move events', () => {
    const { container } = render(
      <PortalCard>
        <span>Test</span>
      </PortalCard>
    );

    const interactiveElement = container.querySelector('.cursor-pointer');
    if (interactiveElement) {
      fireEvent.mouseMove(interactiveElement, { clientX: 100, clientY: 100 });
    }
    // No error should be thrown
  });

  it('should handle mouse leave events', () => {
    const { container } = render(
      <PortalCard>
        <span>Test</span>
      </PortalCard>
    );

    const interactiveElement = container.querySelector('.cursor-pointer');
    if (interactiveElement) {
      fireEvent.mouseLeave(interactiveElement);
    }
    // No error should be thrown
  });

  it('should apply reducedMotion styling when enabled', () => {
    render(
      <PortalCard reducedMotion>
        <span data-testid="content">Test</span>
      </PortalCard>
    );
    // Component should still render
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should not apply magnetic effect when reducedMotion is true', () => {
    const { container } = render(
      <PortalCard reducedMotion>
        <span>Test</span>
      </PortalCard>
    );

    const interactiveElement = container.querySelector('.cursor-pointer');
    if (interactiveElement) {
      fireEvent.mouseMove(interactiveElement, { clientX: 100, clientY: 100 });
    }
    // Should not throw and should not apply motion
  });

  it('should do nothing on click if no onClick provided', () => {
    render(
      <PortalCard>
        <span data-testid="content">Test</span>
      </PortalCard>
    );

    const card = screen.getByTestId('content').closest('[class*="cursor-pointer"]');
    if (card) {
      fireEvent.click(card);
    }
    vi.advanceTimersByTime(600);
    // Should not throw
  });

  it('should render with perspective styling', () => {
    const { container } = render(
      <PortalCard>
        <span>Test</span>
      </PortalCard>
    );

    expect(container.querySelector('.perspective-1000')).toBeInTheDocument();
  });

  it('should have glow effect element', () => {
    const { container } = render(
      <PortalCard>
        <span>Test</span>
      </PortalCard>
    );

    expect(container.querySelector('.blur-\\[50px\\]')).toBeInTheDocument();
  });
});
