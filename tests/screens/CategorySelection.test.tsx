/**
 * Tests for CategorySelection Screen
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CategorySelection from '../../screens/CategorySelection';
import { Category } from '../../types';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
    playSparkle: vi.fn(),
  }),
}));

// Mock sessionMemory
vi.mock('../../utils/sessionMemory', () => ({
  sessionMemory: {
    getInsight: vi.fn().mockReturnValue(null),
  },
}));

describe('CategorySelection', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render the heading', () => {
    render(<CategorySelection onSelect={mockOnSelect} />);

    expect(screen.getByText(/Choose Your/)).toBeInTheDocument();
    expect(screen.getByText('Release')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<CategorySelection onSelect={mockOnSelect} />);

    expect(screen.getByText('Select the emotion closest to your heart')).toBeInTheDocument();
  });

  it('should render all category options', () => {
    render(<CategorySelection onSelect={mockOnSelect} />);

    expect(screen.getByText('Unsent Message')).toBeInTheDocument();
    expect(screen.getByText('Grief & Loss')).toBeInTheDocument();
    expect(screen.getByText('Broken Bonds')).toBeInTheDocument();
    expect(screen.getByText('Regret & Guilt')).toBeInTheDocument();
    expect(screen.getByText('Self-Forgiveness')).toBeInTheDocument();
    expect(screen.getByText('Identity & Confusion')).toBeInTheDocument();
  });

  it('should render category descriptions', () => {
    render(<CategorySelection onSelect={mockOnSelect} />);

    expect(screen.getByText('Words you never got to say.')).toBeInTheDocument();
    expect(screen.getByText('Processing the space they left behind.')).toBeInTheDocument();
    expect(screen.getByText('Relationships that faded or fractured.')).toBeInTheDocument();
    expect(screen.getByText('Making peace with past choices.')).toBeInTheDocument();
    expect(screen.getByText('Learning to be kind to yourself.')).toBeInTheDocument();
    expect(screen.getByText('Finding yourself in the noise.')).toBeInTheDocument();
  });

  it('should render category icons', () => {
    render(<CategorySelection onSelect={mockOnSelect} />);

    expect(screen.getByText('💔')).toBeInTheDocument();
    expect(screen.getByText('🕊️')).toBeInTheDocument();
    expect(screen.getByText('🔗')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🌱')).toBeInTheDocument();
    expect(screen.getByText('🎭')).toBeInTheDocument();
  });

  it('should call onSelect with correct category when clicked', () => {
    render(<CategorySelection onSelect={mockOnSelect} />);

    // Click on "Grief & Loss" by finding parent TiltCard
    const griefTitle = screen.getByText('Grief & Loss');
    const card = griefTitle.closest('div[class*="perspective"]');
    if (card) fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    const selectedCategory: Category = mockOnSelect.mock.calls[0][0];
    expect(selectedCategory.id).toBe('grief');
    expect(selectedCategory.title).toBe('Grief & Loss');
  });

  it('should work with reducedMotion prop', () => {
    const { container } = render(
      <CategorySelection onSelect={mockOnSelect} reducedMotion={true} />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Unsent Message')).toBeInTheDocument();
  });

  it('should show familiar badge for returning user favorite category', async () => {
    // Mock sessionMemory to return a favorite category
    const { sessionMemory } = await import('../../utils/sessionMemory');
    vi.mocked(sessionMemory.getInsight).mockReturnValue({
      isReturning: true,
      totalSessions: 5,
      daysSinceLastVisit: 1,
      lastCategoryTitle: 'Grief',
      mostCommonCategoryId: 'grief',
    });

    vi.resetModules();

    // Need to re-import after mock change
    const { default: CategorySelectionComponent } = await import('../../screens/CategorySelection');

    render(<CategorySelectionComponent onSelect={mockOnSelect} />);

    // Check if familiar badge is shown
    expect(screen.getByText(/Familiar/i)).toBeInTheDocument();
  });

  it('should have 6 category cards', () => {
    const { container } = render(<CategorySelection onSelect={mockOnSelect} />);

    // Count cards by finding elements with perspective class
    const cards = container.querySelectorAll('div[class*="perspective"]');
    expect(cards.length).toBe(6);
  });
});
