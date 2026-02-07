import type { VercelRequest, VercelResponse } from '@vercel/node';

// Gemini API proxy to protect API key
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - restrict to same-origin deployments
  const allowedOrigins = [
    'https://echoesss.vercel.app',
    'https://echoes-emotion.vercel.app',
  ];
  const origin = req.headers.origin || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  res.setHeader('Access-Control-Allow-Origin', corsOrigin || '');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { endpoint, body } = req.body;

    if (!endpoint || !body) {
      return res.status(400).json({ error: 'Missing endpoint or body' });
    }

    // Forward request to Gemini API — use header instead of query param for API key
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return res.status(response.status).json({ error: 'Gemini API error', details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
