/**
 * Tests for PrivacyNotice Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PrivacyNotice from '../../components/PrivacyNotice';

describe('PrivacyNotice', () => {
  it('should render privacy & ethics text', () => {
    render(<PrivacyNotice />);

    expect(screen.getByText('Privacy & Ethics')).toBeInTheDocument();
  });

  it('should render privacy policy button', () => {
    render(<PrivacyNotice />);

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should render terms of service button', () => {
    render(<PrivacyNotice />);

    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('should call onOpenPrivacy when privacy button is clicked', () => {
    const onOpenPrivacy = vi.fn();
    render(<PrivacyNotice onOpenPrivacy={onOpenPrivacy} />);

    fireEvent.click(screen.getByText('Privacy Policy'));

    expect(onOpenPrivacy).toHaveBeenCalledTimes(1);
  });

  it('should call onOpenTerms when terms button is clicked', () => {
    const onOpenTerms = vi.fn();
    render(<PrivacyNotice onOpenTerms={onOpenTerms} />);

    fireEvent.click(screen.getByText('Terms of Service'));

    expect(onOpenTerms).toHaveBeenCalledTimes(1);
  });

  it('should render privacy explanation text', () => {
    render(<PrivacyNotice />);

    expect(screen.getByText(/Your emotions are sacred/i)).toBeInTheDocument();
  });

  it('should render Your Privacy label', () => {
    render(<PrivacyNotice />);

    expect(screen.getByText('Your Privacy')).toBeInTheDocument();
  });

  it('should work without callback props', () => {
    // Should not throw when callbacks are not provided
    const { container } = render(<PrivacyNotice />);

    fireEvent.click(screen.getByText('Privacy Policy'));
    fireEvent.click(screen.getByText('Terms of Service'));

    expect(container).toBeInTheDocument();
  });
});
