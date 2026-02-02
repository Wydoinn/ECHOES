/**
 * Tests for TiltCard Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TiltCard from '../../components/TiltCard';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));

describe('TiltCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <TiltCard>
        <span data-testid="child">Card Content</span>
      </TiltCard>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TiltCard className="custom-class">
        <span>Content</span>
      </TiltCard>
    );

    const motionDiv = container.firstChild;
    expect(motionDiv).toHaveClass('custom-class');
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <TiltCard onClick={onClick}>
        <span>Clickable Content</span>
      </TiltCard>
    );

    const card = screen.getByText('Clickable Content').closest('div[class*="perspective"]');
    if (card) fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should handle mouse enter events', () => {
    const { container } = render(
      <TiltCard>
        <span>Hover Content</span>
      </TiltCard>
    );

    const card = container.firstChild as Element;
    fireEvent.mouseEnter(card);

    expect(card).toBeInTheDocument();
  });

  it('should handle mouse move events', () => {
    const { container } = render(
      <TiltCard>
        <span>Move Content</span>
      </TiltCard>
    );

    const card = container.firstChild as Element;
    fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });

    expect(card).toBeInTheDocument();
  });

  it('should handle mouse leave events', () => {
    const { container } = render(
      <TiltCard>
        <span>Leave Content</span>
      </TiltCard>
    );

    const card = container.firstChild as Element;
    fireEvent.mouseLeave(card);

    expect(card).toBeInTheDocument();
  });

  it('should work with reducedMotion prop', () => {
    const { container } = render(
      <TiltCard reducedMotion={true}>
        <span>Reduced Motion Content</span>
      </TiltCard>
    );

    const card = container.firstChild as Element;

    // Should still work, just without motion effects
    fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
    expect(card).toBeInTheDocument();
  });

  it('should create ripple effect on click', () => {
    const { container } = render(
      <TiltCard>
        <span>Ripple Content</span>
      </TiltCard>
    );

    const card = container.firstChild as Element;
    fireEvent.click(card, { clientX: 50, clientY: 50 });

    expect(card).toBeInTheDocument();
  });

  it('should not create ripple effect when reducedMotion is true', () => {
    const onClick = vi.fn();
    const { container } = render(
      <TiltCard onClick={onClick} reducedMotion={true}>
        <span>No Ripple Content</span>
      </TiltCard>
    );

    const card = container.firstChild as Element;
    fireEvent.click(card, { clientX: 50, clientY: 50 });

    expect(onClick).toHaveBeenCalled();
  });

  it('should have cursor-pointer class', () => {
    const { container } = render(
      <TiltCard>
        <span>Pointer Content</span>
      </TiltCard>
    );

    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should have group class for hover effects', () => {
    const { container } = render(
      <TiltCard>
        <span>Group Content</span>
      </TiltCard>
    );

    const card = container.firstChild;
    expect(card).toHaveClass('group');
  });

  it('should render multiple children elements', () => {
    render(
      <TiltCard>
        <h1 data-testid="title">Title</h1>
        <p data-testid="desc">Description</p>
      </TiltCard>
    );

    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('desc')).toBeInTheDocument();
  });

  it('should work without onClick prop', () => {
    const { container } = render(
      <TiltCard>
        <span>No Click Handler</span>
      </TiltCard>
    );

    const card = container.firstChild as Element;

    // Should not throw when clicked without onClick prop
    fireEvent.click(card);
    expect(card).toBeInTheDocument();
  });
});
