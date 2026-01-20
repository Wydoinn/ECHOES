// Gemini API Service - Routes through backend proxy to protect API key

interface GenerateContentRequest {
  model: string;
  contents: any;
  config?: {
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: any;
  };
}

interface GenerateContentResponse {
  text: string;
  candidates?: any[];
}

class GeminiService {
  private isDevelopment = import.meta.env.DEV;
  private directApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    // In development, can use direct API calls if needed
    // In production, always use the proxy
    if (this.isDevelopment && this.directApiKey) {
      return this.directCall(request);
    }

    return this.proxyCall(request);
  }

  private async proxyCall(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    const endpoint = `models/${request.model}:generateContent`;

    const body: any = {
      contents: Array.isArray(request.contents) ? request.contents : [request.contents],
    };

    if (request.config?.systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: request.config.systemInstruction }]
      };
    }

    if (request.config?.responseMimeType) {
      body.generationConfig = {
        ...body.generationConfig,
        responseMimeType: request.config.responseMimeType,
      };
    }

    if (request.config?.responseSchema) {
      body.generationConfig = {
        ...body.generationConfig,
        responseSchema: request.config.responseSchema,
      };
    }

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint, body }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();

    // Extract text from Gemini response format
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return { text, candidates: data.candidates };
  }

  private async directCall(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    // Dynamic import to avoid bundling in production
    const { GoogleGenAI, Type } = await import('@google/genai');

    const ai = new GoogleGenAI({ apiKey: this.directApiKey });

    const response = await ai.models.generateContent({
      model: request.model,
      contents: request.contents,
      config: request.config as any,
    });

    return { text: response.text || '' };
  }

  async generateContentStream(request: GenerateContentRequest): Promise<AsyncIterable<string>> {
    // For streaming, we'll use the direct SDK in development
    // In production, we'd need to implement SSE in the API route
    if (this.isDevelopment && this.directApiKey) {
      return this.directStreamCall(request);
    }

    // For production, fall back to non-streaming and yield the full response
    const response = await this.proxyCall(request);
    return (async function* () {
      yield response.text;
    })();
  }

  private async directStreamCall(request: GenerateContentRequest): Promise<AsyncIterable<string>> {
    const { GoogleGenAI } = await import('@google/genai');

    const ai = new GoogleGenAI({ apiKey: this.directApiKey });

    const stream = await ai.models.generateContentStream({
      model: request.model,
      contents: request.contents,
      config: request.config as any,
    });

    return (async function* () {
      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    })();
  }
}

export const geminiService = new GeminiService();

// Re-export Type for schema definitions
export { Type } from '@google/genai';
