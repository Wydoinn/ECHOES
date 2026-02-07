// API Key Management Utility
// Handles storage, validation, and tier detection for user-provided Gemini API keys

import { GEMINI_MODEL } from './constants';

const API_KEY_STORAGE_KEY = 'echoes_gemini_api_key';
const API_KEY_TIER_STORAGE_KEY = 'echoes_gemini_api_tier';

export type ApiKeyTier = 'free' | 'paid' | 'unknown';

export interface ApiKeyInfo {
  key: string;
  tier: ApiKeyTier;
  isValid: boolean;
  lastValidated: number;
}

export interface ValidationResult {
  isValid: boolean;
  tier: ApiKeyTier;
  error?: string;
  modelsAvailable?: string[];
}

class ApiKeyManagerService {
  private cachedKey: string | null = null;
  private cachedTier: ApiKeyTier = 'unknown';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      this.cachedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      const tier = localStorage.getItem(API_KEY_TIER_STORAGE_KEY) as ApiKeyTier;
      this.cachedTier = tier || 'unknown';
    } catch (e) {
      console.error('Failed to load API key from storage:', e);
    }
  }

  /**
   * Get the stored API key
   */
  getApiKey(): string | null {
    return this.cachedKey;
  }

  /**
   * Get the tier of the stored API key
   */
  getApiKeyTier(): ApiKeyTier {
    return this.cachedTier;
  }

  /**
   * Check if an API key is configured
   */
  hasApiKey(): boolean {
    return !!this.cachedKey && this.cachedKey.length > 0;
  }

  /**
   * Save an API key after validation
   */
  saveApiKey(key: string, tier: ApiKeyTier): void {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      localStorage.setItem(API_KEY_TIER_STORAGE_KEY, tier);
      this.cachedKey = key;
      this.cachedTier = tier;
    } catch (e) {
      console.error('Failed to save API key:', e);
    }
  }

  /**
   * Clear the stored API key
   */
  clearApiKey(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      localStorage.removeItem(API_KEY_TIER_STORAGE_KEY);
      this.cachedKey = null;
      this.cachedTier = 'unknown';
    } catch (e) {
      console.error('Failed to clear API key:', e);
    }
  }

  /**
   * Validate an API key by making a test request to Gemini API
   * Also detects whether it's a free or paid tier key
   */
  async validateApiKey(key: string): Promise<ValidationResult> {
    if (!key || key.trim().length === 0) {
      return {
        isValid: false,
        tier: 'unknown',
        error: 'API key cannot be empty'
      };
    }

    // Basic format validation (Gemini keys start with 'AI' and are ~39 chars)
    if (key.length < 30) {
      return {
        isValid: false,
        tier: 'unknown',
        error: 'Invalid API key format'
      };
    }

    try {
      // Try to list models - this is a lightweight way to validate the key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || 'Invalid API key';

        if (response.status === 400 || response.status === 401 || response.status === 403) {
          return {
            isValid: false,
            tier: 'unknown',
            error: errorMessage
          };
        }

        return {
          isValid: false,
          tier: 'unknown',
          error: `API error: ${response.status}`
        };
      }

      const data = await response.json();
      const models = data.models || [];
      const modelNames = models.map((m: { name: string }) => m.name);

      // Detect tier based on available models
      // Paid tier typically has access to more models and higher rate limits
      // We can also try a test generation to check rate limits
      const tier = await this.detectTier(key, modelNames);

      return {
        isValid: true,
        tier,
        modelsAvailable: modelNames
      };
    } catch (error) {
      console.error('API key validation error:', error);
      return {
        isValid: false,
        tier: 'unknown',
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Detect if the API key is free tier or paid tier
   * Free tier has lower rate limits and some model restrictions
   */
  private async detectTier(key: string, modelNames: string[]): Promise<ApiKeyTier> {
    try {
      // Try to make a minimal generation request to check rate limits
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Say "test" in one word.' }]
            }],
            generationConfig: {
              maxOutputTokens: 5
            }
          })
        }
      );

      if (response.ok) {
        // Check response headers for rate limit info if available
        const rateLimitLimit = response.headers.get('x-ratelimit-limit-requests');

        // High rate limits typically indicate paid tier
        if (rateLimitLimit) {
          const limit = parseInt(rateLimitLimit, 10);
          if (limit > 60) {
            return 'paid';
          }
        }

        // If we can't determine from headers, check model availability
        // Paid users often have access to more experimental models
        const hasPremiumModels = modelNames.some(name =>
          name.includes('ultra') ||
          name.includes('pro-vision') ||
          name.includes('1.5-pro-002')
        );

        return hasPremiumModels ? 'paid' : 'free';
      }

      // If rate limited immediately, likely free tier
      if (response.status === 429) {
        return 'free';
      }

      return 'unknown';
    } catch {
      // If we can't detect, assume free tier for safety
      return 'free';
    }
  }

  /**
   * Get usage info for display
   */
  getUsageInfo(): { tierLabel: string; tierDescription: string; tierColor: string } {
    switch (this.cachedTier) {
      case 'paid':
        return {
          tierLabel: 'Paid Tier',
          tierDescription: 'Higher rate limits, priority access',
          tierColor: 'text-emerald-400'
        };
      case 'free':
        return {
          tierLabel: 'Free Tier',
          tierDescription: '15 requests/minute, 1,500 requests/day',
          tierColor: 'text-amber-400'
        };
      default:
        return {
          tierLabel: 'Unknown Tier',
          tierDescription: 'Tier detection unavailable',
          tierColor: 'text-gray-400'
        };
    }
  }
}

export const apiKeyManager = new ApiKeyManagerService();
