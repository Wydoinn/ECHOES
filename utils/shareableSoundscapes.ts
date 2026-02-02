/**
 * Shareable Soundscapes
 * Feature 12: Generate unique URL for AI-generated ambient soundscapes
 */

import { SoundscapeParams } from '../types';

const SOUNDSCAPE_STORAGE_KEY = 'echoes_soundscapes';

interface StoredSoundscape {
  id: string;
  params: SoundscapeParams;
  emotion: string;
  reflection: string;
  createdAt: number;
}

/**
 * Generate a unique ID for a soundscape
 */
const generateSoundscapeId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Encode soundscape params to a compact URL-safe string
 */
const encodeSoundscapeToURL = (params: SoundscapeParams): string => {
  const data = {
    f: params.baseFrequency,
    h: params.harmonic,
    t: params.tempo,
    e: params.elements.map(el => ({
      t: el.type,
      n: el.note,
      i: el.interval,
      c: el.color,
      v: el.volume
    }))
  };

  const jsonString = JSON.stringify(data);
  const base64 = btoa(jsonString);
  // Make URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Decode soundscape params from URL string
 */
const decodeSoundscapeFromURL = (encoded: string): SoundscapeParams | null => {
  try {
    // Restore URL-safe characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const jsonString = atob(base64);
    const data = JSON.parse(jsonString);

    interface EncodedElement {
      t: string;
      n: string;
      i: number;
      c: string;
      v: number;
    }

    return {
      baseFrequency: data.f,
      harmonic: data.h,
      tempo: data.t,
      description: 'Shared Soundscape',
      elements: data.e.map((el: EncodedElement) => ({
        type: el.t,
        note: el.n,
        interval: el.i,
        color: el.c,
        volume: el.v
      }))
    };
  } catch (e) {
    console.error('Failed to decode soundscape:', e);
    return null;
  }
};

/**
 * Generate a shareable link for a soundscape
 */
export const generateShareableLink = (
  params: SoundscapeParams,
  emotion: string,
  reflection: string
): string => {
  const id = generateSoundscapeId();

  // Store locally for retrieval
  saveSoundscape({
    id,
    params,
    emotion,
    reflection,
    createdAt: Date.now()
  });

  const encoded = encodeSoundscapeToURL(params);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return `${baseUrl}/?soundscape=${id}&s=${encoded}`;
};

/**
 * Parse soundscape from URL parameters
 */
export const parseSoundscapeFromURL = (): { params: SoundscapeParams; id: string } | null => {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('soundscape');
  const encoded = urlParams.get('s');

  if (!encoded) return null;

  const params = decodeSoundscapeFromURL(encoded);
  if (!params) return null;

  return { params, id: id || 'shared' };
};

/**
 * Save soundscape to local storage
 */
const saveSoundscape = (soundscape: StoredSoundscape): void => {
  try {
    const existing = getSavedSoundscapes();
    existing.push(soundscape);
    // Keep last 20
    const trimmed = existing.slice(-20);
    localStorage.setItem(SOUNDSCAPE_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save soundscape:', e);
  }
};

/**
 * Get saved soundscapes
 */
export const getSavedSoundscapes = (): StoredSoundscape[] => {
  try {
    return JSON.parse(localStorage.getItem(SOUNDSCAPE_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

/**
 * Get a specific soundscape by ID
 */
export const getSoundscapeById = (id: string): StoredSoundscape | null => {
  const soundscapes = getSavedSoundscapes();
  return soundscapes.find(s => s.id === id) || null;
};

/**
 * Delete a soundscape
 */
export const deleteSoundscape = (id: string): void => {
  try {
    const soundscapes = getSavedSoundscapes();
    const filtered = soundscapes.filter(s => s.id !== id);
    localStorage.setItem(SOUNDSCAPE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete soundscape:', e);
  }
};

/**
 * Copy shareable link to clipboard
 */
export const copyShareableLinkToClipboard = async (
  params: SoundscapeParams,
  emotion: string,
  reflection: string
): Promise<boolean> => {
  const link = generateShareableLink(params, emotion, reflection);

  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = link;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};
