/**
 * Retry utility with exponential backoff for transient API errors.
 * Handles 503 (overloaded), 429 (rate limit), and network errors.
 */

/** Check whether an error is retryable (503, 429, or network failure). */
function isRetryable(err: unknown): boolean {
  const message = (err as { message?: string })?.message ?? '';
  const code = (err as { code?: number })?.code;
  // 503 Service Unavailable / model overloaded
  if (code === 503 || message.includes('503') || message.includes('UNAVAILABLE') || message.includes('overloaded')) return true;
  // 429 Rate limit
  if (code === 429 || message.includes('429') || message.includes('rate') || message.includes('quota')) return true;
  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('ECONNRESET') || message.includes('Timeout')) return true;
  return false;
}

/**
 * Retry an async operation with exponential backoff.
 * Only retries on transient/retryable errors; other errors are thrown immediately.
 *
 * @param fn        The async function to execute.
 * @param maxRetries Maximum number of retry attempts (default 3).
 * @param baseDelay Initial delay in ms before first retry (default 1000).
 * @returns         The resolved value from `fn`.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && isRetryable(err)) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  // Should never reach here, but satisfies TypeScript
  throw lastError;
}
