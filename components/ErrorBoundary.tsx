import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import * as Sentry from '@sentry/react';
import { CONTACT_EMAIL } from '../utils/constants';

const IS_PRODUCTION = import.meta.env.PROD;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Send error to Sentry
    const eventId = Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
    this.setState({ eventId });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, eventId: null });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-[#0d0617]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full text-center"
          >
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Title */}
            <h1 className="font-serif-display text-2xl text-white/90 mb-3">
              Something Went Wrong
            </h1>

            {/* Error Description */}
            <p className="text-white/50 mb-6 font-light">
              An unexpected error occurred. Don&apos;t worry — your journey is safe,
              and you can try again.
            </p>

            {/* Error Details (Collapsible - only in development) */}
            {this.state.error && !IS_PRODUCTION && (
              <details className="mb-6 text-left">
                <summary className="text-white/60 text-sm cursor-pointer hover:text-white/80 transition-colors">
                  Technical details
                </summary>
                <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-rose-400/80 text-sm font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-xs text-white/30 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={this.handleRetry}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium hover:from-amber-400 hover:to-amber-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>

              <motion.button
                onClick={this.handleRefresh}
                className="px-6 py-3 rounded-full border border-white/20 text-white/70 hover:bg-white/5 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Refresh Page
              </motion.button>

              {this.state.eventId && (
                <motion.button
                  onClick={this.handleReportFeedback}
                  className="px-6 py-3 rounded-full border border-amber-500/30 text-amber-400/70 hover:bg-amber-500/5 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Report Issue
                </motion.button>
              )}
            </div>

            {/* Support Link */}
            <p className="mt-8 text-white/30 text-sm">
              If this keeps happening, please{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2"
              >
                contact support
              </a>
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Custom hook-based error boundary for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return { handleError, resetError };
}
