function isRetryable(err: unknown): boolean {
  const message = (err as { message?: string })?.message ?? '';
  const code = (err as { code?: number })?.code;
  if (code === 503 || message.includes('503') || message.includes('UNAVAILABLE') || message.includes('overloaded')) return true;
  if (code === 429 || message.includes('429') || message.includes('rate') || message.includes('quota')) return true;
  if (message.includes('fetch') || message.includes('network') || message.includes('ECONNRESET') || message.includes('Timeout')) return true;
  return false;
}

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
  throw lastError;
}
