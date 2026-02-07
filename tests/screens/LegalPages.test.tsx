/**
 * Tests for LegalPages screen
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, className, onClick, ...props }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
      <button className={className} onClick={onClick} {...props}>{children}</button>
    ),
    article: ({ children, className, id, ...props }: React.PropsWithChildren<{ className?: string; id?: string }>) => (
      <article className={className} id={id} {...props}>{children}</article>
    ),
  },
}));

// Import after mock
import { PrivacyPolicy, TermsOfService } from '../../screens/LegalPages';

describe('PrivacyPolicy', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render privacy policy heading', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should render back button', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Back to ECHOES')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('Back to ECHOES'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should render skip to content link', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('should render section about commitment to privacy', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Our Commitment to Your Privacy')).toBeInTheDocument();
  });

  it('should render section about what is collected', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('What We Collect')).toBeInTheDocument();
    expect(screen.getByText('Emotional Content')).toBeInTheDocument();
    expect(screen.getByText('Local Storage')).toBeInTheDocument();
    expect(screen.getByText('Analytics (Optional)')).toBeInTheDocument();
  });

  it('should render section about third-party services', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Third-Party Services')).toBeInTheDocument();
  });

  it('should render section about user rights', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Your Rights')).toBeInTheDocument();
  });

  it('should render section about data security', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Data Security')).toBeInTheDocument();
  });

  it('should render section about children privacy', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText("Children's Privacy")).toBeInTheDocument();
  });

  it('should render contact section', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('santhoshs1881@gmail.com')).toBeInTheDocument();
  });

  it('should render link to Google AI Terms', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    const link = screen.getByText("Google's AI Terms");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('https://ai.google.dev/terms');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should have main content id for skip link', () => {
    const { container } = render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(container.querySelector('#main-content')).toBeInTheDocument();
  });
});

describe('TermsOfService', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render terms of service heading', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('should render back button', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Back to ECHOES')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('Back to ECHOES'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should render skip to content link', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('should render welcome section', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Welcome to ECHOES')).toBeInTheDocument();
  });

  it('should render acceptable use section', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Acceptable Use')).toBeInTheDocument();
  });

  it('should render important disclaimers', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText(/Important Disclaimer/i)).toBeInTheDocument();
  });

  it('should render your content section', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Your Content')).toBeInTheDocument();
  });

  it('should render AI-generated content section', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('AI-Generated Content')).toBeInTheDocument();
  });

  it('should render section about limitation of liability', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Limitation of Liability')).toBeInTheDocument();
  });

  it('should render contact section', () => {
    render(<TermsOfService onBack={mockOnBack} />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('santhoshs1881@gmail.com')).toBeInTheDocument();
  });

  it('should have main content id for skip link', () => {
    const { container } = render(<TermsOfService onBack={mockOnBack} />);
    expect(container.querySelector('#main-content')).toBeInTheDocument();
  });
});
