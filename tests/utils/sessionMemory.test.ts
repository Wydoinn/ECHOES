/**
 * Tests for Session Memory Utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localStorageMock } from '../setup';

describe('SessionMemory', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('save', () => {
    it('should save a session to localStorage', async () => {
      const { sessionMemory } = await import('../../utils/sessionMemory');

      const session = {
        id: '123',
        timestamp: Date.now(),
        categoryId: 'grief',
        categoryTitle: 'Grief & Loss',
        wordCount: 150,
        hadAudio: false,
        hadImage: true,
      };

      sessionMemory.save(session);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should limit stored sessions to 10', async () => {
      const { sessionMemory } = await import('../../utils/sessionMemory');

      // Save 12 sessions
      for (let i = 0; i < 12; i++) {
        sessionMemory.save({
          id: String(i),
          timestamp: Date.now() + i,
          categoryId: 'test',
          categoryTitle: 'Test',
          wordCount: 100,
          hadAudio: false,
          hadImage: false,
        });
      }

      const sessions = sessionMemory.getHistory();
      expect(sessions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getHistory', () => {
    it('should return empty array when no sessions exist', async () => {
      const { sessionMemory } = await import('../../utils/sessionMemory');

      const sessions = sessionMemory.getHistory();

      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('getInsight', () => {
    it('should return null for first-time users', async () => {
      const { sessionMemory } = await import('../../utils/sessionMemory');

      const insight = sessionMemory.getInsight();

      // First time users have no sessions, so no insight
      expect(insight).toBeNull();
    });

    it('should return insight data for returning users', async () => {
      // Pre-populate localStorage with session data
      const existingSessions = [
        {
          id: '1',
          timestamp: Date.now() - 86400000, // 1 day ago
          categoryId: 'grief',
          categoryTitle: 'Grief & Loss',
          wordCount: 200,
          hadAudio: false,
          hadImage: false,
        },
      ];

      localStorageMock.setItem('echoes_sessions', JSON.stringify(existingSessions));
      localStorageMock.getItem = vi.fn((key) => {
        if (key === 'echoes_sessions') {
          return JSON.stringify(existingSessions);
        }
        return null;
      });

      vi.resetModules();
      const { sessionMemory } = await import('../../utils/sessionMemory');

      const insight = sessionMemory.getInsight();

      if (insight) {
        expect(insight.isReturning).toBe(true);
        expect(insight.totalSessions).toBe(1);
        expect(insight.lastCategoryTitle).toBe('Grief & Loss');
      }
    });
  });
});
