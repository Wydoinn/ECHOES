/**
 * Tests for AftercareKit Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AftercareKit from '../../components/AftercareKit';
import { Aftercare } from '../../types';

// Mock SoundManager
vi.mock('../../components/SoundManager', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));

const mockAftercareData: Aftercare = {
  summary: 'Take a moment to ground yourself after this emotional release.',
  practices: [
    {
      title: 'Box Breathing',
      description: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.',
      icon: '🌬️',
      type: 'physical'
    },
    {
      title: 'Gentle Journaling',
      description: 'Write down three things you are grateful for.',
      icon: '✍️',
      type: 'reflective'
    },
    {
      title: 'Connect',
      description: 'Send a simple text to someone you trust.',
      icon: '🤝',
      type: 'social'
    }
  ]
};

describe('AftercareKit', () => {
  it('should render the header with care icon', () => {
    render(<AftercareKit data={mockAftercareData} />);

    expect(screen.getByText('🌿')).toBeInTheDocument();
  });

  it('should render grounding & care heading', () => {
    render(<AftercareKit data={mockAftercareData} />);

    expect(screen.getByText('Grounding &')).toBeInTheDocument();
    expect(screen.getByText('Care')).toBeInTheDocument();
  });

  it('should render the summary text', () => {
    render(<AftercareKit data={mockAftercareData} />);

    expect(screen.getByText(mockAftercareData.summary)).toBeInTheDocument();
  });

  it('should render all practice cards', () => {
    render(<AftercareKit data={mockAftercareData} />);

    mockAftercareData.practices.forEach(practice => {
      expect(screen.getByText(practice.title)).toBeInTheDocument();
      expect(screen.getByText(practice.description)).toBeInTheDocument();
    });
  });

  it('should render practice icons', () => {
    render(<AftercareKit data={mockAftercareData} />);

    mockAftercareData.practices.forEach(practice => {
      expect(screen.getByText(practice.icon)).toBeInTheDocument();
    });
  });

  it('should render practice type badges', () => {
    render(<AftercareKit data={mockAftercareData} />);

    expect(screen.getByText('physical')).toBeInTheDocument();
    expect(screen.getByText('reflective')).toBeInTheDocument();
    expect(screen.getByText('social')).toBeInTheDocument();
  });

  it('should render disclaimer text', () => {
    render(<AftercareKit data={mockAftercareData} />);

    expect(screen.getByText('These are gentle suggestions, not medical advice.')).toBeInTheDocument();
  });

  it('should apply correct styling for physical practice type', () => {
    render(<AftercareKit data={mockAftercareData} />);

    const physicalBadge = screen.getByText('physical');
    expect(physicalBadge).toHaveClass('border-violet-500/30');
  });

  it('should apply correct styling for reflective practice type', () => {
    render(<AftercareKit data={mockAftercareData} />);

    const reflectiveBadge = screen.getByText('reflective');
    expect(reflectiveBadge).toHaveClass('border-purple-500/30');
  });

  it('should apply correct styling for social practice type', () => {
    render(<AftercareKit data={mockAftercareData} />);

    const socialBadge = screen.getByText('social');
    expect(socialBadge).toHaveClass('border-fuchsia-500/30');
  });

  it('should work with reducedMotion prop', () => {
    const { container } = render(
      <AftercareKit data={mockAftercareData} reducedMotion={true} />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Box Breathing')).toBeInTheDocument();
  });

  it('should render with empty practices array', () => {
    const emptyData: Aftercare = {
      summary: 'No practices available.',
      practices: []
    };

    const { container } = render(<AftercareKit data={emptyData} />);

    expect(container).toBeInTheDocument();
    expect(screen.getByText('No practices available.')).toBeInTheDocument();
  });

  it('should render multiple practices in grid layout', () => {
    const manyPractices: Aftercare = {
      summary: 'Multiple practices.',
      practices: [
        { title: 'Practice 1', description: 'Desc 1', icon: '1️⃣', type: 'physical' },
        { title: 'Practice 2', description: 'Desc 2', icon: '2️⃣', type: 'reflective' },
        { title: 'Practice 3', description: 'Desc 3', icon: '3️⃣', type: 'social' },
        { title: 'Practice 4', description: 'Desc 4', icon: '4️⃣', type: 'physical' },
      ]
    };

    render(<AftercareKit data={manyPractices} />);

    expect(screen.getByText('Practice 1')).toBeInTheDocument();
    expect(screen.getByText('Practice 2')).toBeInTheDocument();
    expect(screen.getByText('Practice 3')).toBeInTheDocument();
    expect(screen.getByText('Practice 4')).toBeInTheDocument();
  });
});
