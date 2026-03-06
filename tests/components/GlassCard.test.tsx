/**
 * Tests for GlassCard Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GlassCard from '../../components/GlassCard';

describe('GlassCard', () => {
  it('should render children correctly', () => {
    render(
      <GlassCard>
        <div data-testid="child-content">Test Content</div>
      </GlassCard>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <GlassCard className="custom-class">
        <span>Content</span>
      </GlassCard>
    );

    const motionDiv = container.firstChild;
    expect(motionDiv).toHaveClass('custom-class');
  });

  it('should accept delay prop', () => {
    // This test verifies the component accepts the delay prop without errors
    const { container } = render(
      <GlassCard delay={0.5}>
        <span>Delayed Content</span>
      </GlassCard>
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Delayed Content')).toBeInTheDocument();
  });

  it('should render with default props', () => {
    const { container } = render(
      <GlassCard>
        <span>Default Props Content</span>
      </GlassCard>
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Default Props Content')).toBeInTheDocument();
  });

  it('should have group class for hover effects', () => {
    const { container } = render(
      <GlassCard>
        <span>Content</span>
      </GlassCard>
    );

    const motionDiv = container.firstChild;
    expect(motionDiv).toHaveClass('group');
  });

  it('should render multiple children', () => {
    render(
      <GlassCard>
        <h1 data-testid="heading">Title</h1>
        <p data-testid="paragraph">Description</p>
        <button data-testid="button">Click Me</button>
      </GlassCard>
    );

    expect(screen.getByTestId('heading')).toBeInTheDocument();
    expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should preserve children structure', () => {
    render(
      <GlassCard>
        <div data-testid="nested">
          <span data-testid="inner">Nested Content</span>
        </div>
      </GlassCard>
    );

    const nested = screen.getByTestId('nested');
    const inner = screen.getByTestId('inner');

    expect(nested).toContainElement(inner);
  });
});
