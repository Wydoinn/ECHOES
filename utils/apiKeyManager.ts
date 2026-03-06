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
    } catch {
      // storage unavailable
    }
  }

  getApiKey(): string | null {
    return this.cachedKey;
  }

  getApiKeyTier(): ApiKeyTier {
    return this.cachedTier;
  }

  hasApiKey(): boolean {
    return !!this.cachedKey && this.cachedKey.length > 0;
  }

  saveApiKey(key: string, tier: ApiKeyTier): void {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      localStorage.setItem(API_KEY_TIER_STORAGE_KEY, tier);
      this.cachedKey = key;
      this.cachedTier = tier;
    } catch {
      // storage unavailable
    }
  }

  clearApiKey(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      localStorage.removeItem(API_KEY_TIER_STORAGE_KEY);
      this.cachedKey = null;
      this.cachedTier = 'unknown';
    } catch {
      // storage unavailable
    }
  }

  async validateApiKey(key: string): Promise<ValidationResult> {
    if (!key || key.trim().length === 0) {
      return {
        isValid: false,
        tier: 'unknown',
        error: 'API key cannot be empty'
      };
    }

    // Basic format validation
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
        'https://generativelanguage.googleapis.com/v1beta/models',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
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

      const tier = await this.detectTier(key, modelNames);

      return {
        isValid: true,
        tier,
        modelsAvailable: modelNames
      };
    } catch {
      return {
        isValid: false,
        tier: 'unknown',
        error: 'Network error'
      };
    }
  }

  private async detectTier(key: string, _modelNames: string[]): Promise<ApiKeyTier> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
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
        const rateLimitLimit = response.headers.get('x-ratelimit-limit-requests');

        if (rateLimitLimit) {
          const limit = parseInt(rateLimitLimit, 10);
          if (limit > 100) {
            return 'paid';
          }
        }

        return 'free';
      }

      if (response.status === 429) {
        return 'free';
      }

      return 'unknown';
    } catch {
      return 'free';
    }
  }

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
