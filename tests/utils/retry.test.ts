/**
 * Tests for retry utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from '../../utils/retry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return result on first successful call', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on 503 error code', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 503, message: '' })
      .mockResolvedValue('recovered');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 503 in message', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on UNAVAILABLE message', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('UNAVAILABLE'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on overloaded message', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('server overloaded'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 429 error code', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 429, message: '' })
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 429 in message', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on rate limit message', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('rate limit exceeded'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on quota message', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('quota exceeded'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on fetch error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on network error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on ECONNRESET', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on Timeout', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 0);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should not retry on non-retryable errors', async () => {
    const fn = vi.fn()
      .mockRejectedValue(new Error('Some other error'));

    await expect(withRetry(fn, 3, 0)).rejects.toThrow('Some other error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw after exhausting retries', async () => {
    vi.useRealTimers();
    const error = new Error('503 Service Unavailable');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, 2, 0)).rejects.toThrow('503 Service Unavailable');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should handle errors without message property', async () => {
    const fn = vi.fn()
      .mockRejectedValue(42);

    await expect(withRetry(fn, 1, 0)).rejects.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use default retry parameters', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
  });
});
