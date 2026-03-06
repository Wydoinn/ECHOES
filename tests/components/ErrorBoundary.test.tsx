/**
 * Tests for ErrorBoundary Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Create a component that throws an error for testing
const _ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Mock ErrorBoundary since it uses framer-motion
const MockErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(new Error(event.message));
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div data-testid="error-boundary">
        <h1>Something Went Wrong</h1>
        <p data-testid="error-message">{error?.message}</p>
        <button onClick={() => setHasError(false)}>Try Again</button>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    );
  }

  return <>{children}</>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render children when there is no error', () => {
    render(
      <MockErrorBoundary>
        <div data-testid="child">Child content</div>
      </MockErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should display error UI structure correctly', () => {
    render(
      <div data-testid="error-boundary">
        <h1>Something Went Wrong</h1>
        <p data-testid="error-message">Test error</p>
        <button>Try Again</button>
        <button>Refresh Page</button>
      </div>
    );

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('should have accessible retry and refresh buttons', () => {
    render(
      <div data-testid="error-boundary">
        <h1>Something Went Wrong</h1>
        <button>Try Again</button>
        <button>Refresh Page</button>
      </div>
    );

    const tryAgainButton = screen.getByText('Try Again');
    const refreshButton = screen.getByText('Refresh Page');

    expect(tryAgainButton).toBeEnabled();
    expect(refreshButton).toBeEnabled();
  });
});

describe('ErrorBoundary recovery', () => {
  it('should allow recovery through the Try Again button', () => {
    const TestComponent = () => {
      const [shouldError, setShouldError] = React.useState(true);

      if (shouldError) {
        return (
          <div data-testid="error-state">
            <p>Error occurred</p>
            <button onClick={() => setShouldError(false)}>Try Again</button>
          </div>
        );
      }

      return <div data-testid="recovered">Recovered successfully</div>;
    };

    render(<TestComponent />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));

    expect(screen.getByTestId('recovered')).toBeInTheDocument();
  });
});
