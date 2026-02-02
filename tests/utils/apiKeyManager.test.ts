/**
 * Tests for API Key Manager Utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localStorageMock } from '../setup';

// We need to import after mocks are set up
const API_KEY_STORAGE_KEY = 'echoes_gemini_api_key';
const API_KEY_TIER_STORAGE_KEY = 'echoes_gemini_api_tier';

describe('ApiKeyManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('hasApiKey', () => {
    it('should return false when no key is stored', async () => {
      // Dynamic import to get fresh instance
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      // Clear cached key
      apiKeyManager.clearApiKey();

      expect(apiKeyManager.hasApiKey()).toBe(false);
    });

    it('should return true when a key is stored', async () => {
      localStorageMock.setItem(API_KEY_STORAGE_KEY, 'test-api-key-12345678901234567890');

      // Re-import to get fresh instance with the stored key
      vi.resetModules();
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      expect(apiKeyManager.hasApiKey()).toBe(true);
    });
  });

  describe('saveApiKey', () => {
    it('should save the API key to localStorage', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');
      const testKey = 'AIzaSyTestKey123456789012345678901234';

      apiKeyManager.saveApiKey(testKey, 'free');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(API_KEY_STORAGE_KEY, testKey);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(API_KEY_TIER_STORAGE_KEY, 'free');
    });

    it('should update cached values', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');
      const testKey = 'AIzaSyTestKey123456789012345678901234';

      apiKeyManager.saveApiKey(testKey, 'paid');

      expect(apiKeyManager.getApiKey()).toBe(testKey);
      expect(apiKeyManager.getApiKeyTier()).toBe('paid');
    });
  });

  describe('clearApiKey', () => {
    it('should remove the API key from localStorage', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      apiKeyManager.saveApiKey('test-key-12345678901234567890123456', 'free');
      apiKeyManager.clearApiKey();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(API_KEY_STORAGE_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(API_KEY_TIER_STORAGE_KEY);
      expect(apiKeyManager.hasApiKey()).toBe(false);
    });
  });

  describe('getApiKeyTier', () => {
    it('should return unknown when no tier is set', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');
      apiKeyManager.clearApiKey();

      expect(apiKeyManager.getApiKeyTier()).toBe('unknown');
    });

    it('should return the correct tier after saving', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      apiKeyManager.saveApiKey('test-key-12345678901234567890123456', 'paid');

      expect(apiKeyManager.getApiKeyTier()).toBe('paid');
    });
  });

  describe('getUsageInfo', () => {
    it('should return correct info for free tier', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      apiKeyManager.saveApiKey('test-key-12345678901234567890123456', 'free');
      const info = apiKeyManager.getUsageInfo();

      expect(info.tierLabel).toBe('Free Tier');
      expect(info.tierColor).toBe('text-amber-400');
    });

    it('should return correct info for paid tier', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      apiKeyManager.saveApiKey('test-key-12345678901234567890123456', 'paid');
      const info = apiKeyManager.getUsageInfo();

      expect(info.tierLabel).toBe('Paid Tier');
      expect(info.tierColor).toBe('text-emerald-400');
    });
  });

  describe('validateApiKey', () => {
    it('should reject empty keys', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      const result = await apiKeyManager.validateApiKey('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('API key cannot be empty');
    });

    it('should reject keys that are too short', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      const result = await apiKeyManager.validateApiKey('short-key');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid API key format');
    });

    it('should attempt validation for properly formatted keys', async () => {
      const { apiKeyManager } = await import('../../utils/apiKeyManager');

      // Mock fetch for this test
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ models: [{ name: 'gemini-pro' }] }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const longEnoughKey = 'AIzaSyTestKey123456789012345678901234';
      const _result = await apiKeyManager.validateApiKey(longEnoughKey);

      // The first fetch should be called to validate
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
