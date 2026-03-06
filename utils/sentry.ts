import {
  init,
  setUser,
  setContext,
  captureException,
  addBreadcrumb as sentryAddBreadcrumb,
  startInactiveSpan,
} from '@sentry/react';
import type { Span } from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
const IS_PRODUCTION = import.meta.env.PROD;

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export function initSentry(): void {
  if (!SENTRY_DSN) {
    return;
  }

  init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Performance Monitoring
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

    // Filter out non-actionable errors
    ignoreErrors: [
      // Browser extensions
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,

      // Network errors (handled by app)
      'Network request failed',
      'Failed to fetch',
      'Load failed',

      // User-initiated cancellations
      'AbortError',
      'The operation was aborted',

      // Resize observer (benign)
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],

    // Don't send PII
    beforeSend(event) {
      // Remove any user input that might contain emotional content
      if (event.extra) {
        delete event.extra.userInput;
        delete event.extra.emotionalContent;
        delete event.extra.text;
      }

      // Scrub breadcrumbs of any text content
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data?.text) {
            breadcrumb.data.text = '[REDACTED]';
          }
          return breadcrumb;
        });
      }

      return event;
    },

    // Tag releases for tracking
    release: `echoes@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
  });
}

export function setUserContext(options: {
  sessionId?: string;
  tier?: string;
  locale?: string;
}): void {
  setUser({
    id: options.sessionId,
  });

  setContext('user_meta', {
    tier: options.tier,
    locale: options.locale,
  });
}

export function clearUserContext(): void {
  setUser(null);
}

export function captureError(
  error: Error,
  context?: Record<string, unknown>
): string {
  return captureException(error, {
    extra: context,
  });
}

export function addBreadcrumb(
  message: string,
  category: string,
  level: SeverityLevel = 'info'
): void {
  sentryAddBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

export function startTransaction(
  name: string,
  op: string
): Span | undefined {
  return startInactiveSpan({ name, op });
}
