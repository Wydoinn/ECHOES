/**
 * Tests for GeminiService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @google/genai module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: 'Generated response text',
      }),
      generateContentStream: vi.fn().mockImplementation(async function* () {
        yield { text: 'Chunk 1' };
        yield { text: 'Chunk 2' };
      }),
    },
  })),
  Type: {
    STRING: 'string',
    NUMBER: 'number',
    OBJECT: 'object',
    ARRAY: 'array',
    BOOLEAN: 'boolean',
  },
}));

describe('GeminiService', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.resetModules();
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('generateContent', () => {
    it('should call proxy endpoint in production mode', async () => {
      // Mock import.meta.env
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Proxy response' }],
                },
              },
            ],
          }),
      });

      const { geminiService } = await import('../../services/geminiService');

      const result = await geminiService.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: 'Hello' }], role: 'user' },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/gemini', expect.any(Object));
      expect(result.text).toBe('Proxy response');
    });

    it('should handle proxy error response', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'API error message' }),
      });

      const { geminiService } = await import('../../services/geminiService');

      await expect(
        geminiService.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ text: 'Hello' }], role: 'user' },
        })
      ).rejects.toThrow('API error message');
    });

    it('should handle proxy error without message', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const { geminiService } = await import('../../services/geminiService');

      await expect(
        geminiService.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ text: 'Hello' }], role: 'user' },
        })
      ).rejects.toThrow('API request failed');
    });

    it('should include systemInstruction in proxy request', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Response' }] } }],
          }),
      });

      const { geminiService } = await import('../../services/geminiService');

      await geminiService.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: 'Hello' }], role: 'user' },
        config: {
          systemInstruction: 'You are a helpful assistant.',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/gemini',
        expect.objectContaining({
          body: expect.stringContaining('systemInstruction'),
        })
      );
    });

    it('should include responseMimeType in proxy request', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: '{}' }] } }],
          }),
      });

      const { geminiService } = await import('../../services/geminiService');

      await geminiService.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: 'Hello' }], role: 'user' },
        config: {
          responseMimeType: 'application/json',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/gemini',
        expect.objectContaining({
          body: expect.stringContaining('application/json'),
        })
      );
    });

    it('should handle array of contents', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Response' }] } }],
          }),
      });

      const { geminiService } = await import('../../services/geminiService');

      await geminiService.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { parts: [{ text: 'Hello' }], role: 'user' },
          { parts: [{ text: 'Hi there!' }], role: 'model' },
        ],
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle empty candidates response', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      const { geminiService } = await import('../../services/geminiService');

      const result = await geminiService.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: 'Hello' }], role: 'user' },
      });

      expect(result.text).toBe('');
    });
  });

  describe('generateContentStream', () => {
    it('should fall back to non-streaming in production', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Full response' }] } }],
          }),
      });

      const { geminiService } = await import('../../services/geminiService');

      const stream = await geminiService.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: 'Hello' }], role: 'user' },
      });

      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Full response']);
    });
  });
});
