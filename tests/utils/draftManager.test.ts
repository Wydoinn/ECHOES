/**
 * Tests for Draft Manager Utility
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { localStorageMock } from '../setup';

const DRAFTS_KEY = 'echoes_drafts';
const CURRENT_DRAFT_KEY = 'echoes_current_draft';

describe('DraftManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('saveDraft', () => {
    it('should save a new draft to localStorage', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const draftInput = {
        categoryId: 'grief',
        categoryTitle: 'Grief & Loss',
        text: 'This is my draft text',
        drawing: null,
        transcription: null
      };

      const result = draftManager.saveDraft(draftInput);

      expect(result.categoryId).toBe('grief');
      expect(result.categoryTitle).toBe('Grief & Loss');
      expect(result.text).toBe('This is my draft text');
      expect(result.id).toContain('draft_');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should update existing draft for same category', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      // Save first draft
      vi.setSystemTime(new Date(2025, 0, 1, 10, 0, 0));
      const firstDraft = draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief & Loss',
        text: 'First text',
        drawing: null,
        transcription: null
      });

      // Update same category
      vi.setSystemTime(new Date(2025, 0, 1, 11, 0, 0));
      const updatedDraft = draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief & Loss',
        text: 'Updated text',
        drawing: 'data:image/png',
        transcription: 'Voice transcription'
      });

      // Should keep same ID
      expect(updatedDraft.id).toBe(firstDraft.id);
      expect(updatedDraft.text).toBe('Updated text');
      expect(updatedDraft.drawing).toBe('data:image/png');
      expect(updatedDraft.createdAt).toBe(firstDraft.createdAt);
    });

    it('should create new draft for different category', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      vi.setSystemTime(new Date(2025, 0, 1, 10, 0, 0));
      const firstDraft = draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief & Loss',
        text: 'Grief text',
        drawing: null,
        transcription: null
      });

      vi.setSystemTime(new Date(2025, 0, 1, 11, 0, 0));
      const secondDraft = draftManager.saveDraft({
        categoryId: 'anger',
        categoryTitle: 'Anger',
        text: 'Anger text',
        drawing: null,
        transcription: null
      });

      expect(secondDraft.id).not.toBe(firstDraft.id);
    });
  });

  describe('getCurrentDraft', () => {
    it('should return null when no draft exists', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      expect(draftManager.getCurrentDraft()).toBeNull();
    });

    it('should return the current draft', async () => {
      const draftData = {
        id: 'draft_123',
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: 'Test',
        drawing: null,
        transcription: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      localStorageMock.setItem(CURRENT_DRAFT_KEY, JSON.stringify(draftData));

      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const result = draftManager.getCurrentDraft();
      expect(result).not.toBeNull();
      expect(result?.id).toBe('draft_123');
    });

    it('should return null on invalid JSON', async () => {
      localStorageMock.setItem(CURRENT_DRAFT_KEY, 'invalid-json');

      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      // Mock JSON.parse to throw
      const originalParse = JSON.parse;
      JSON.parse = vi.fn().mockImplementation(() => {
        throw new Error('Invalid JSON');
      });

      const result = draftManager.getCurrentDraft();
      expect(result).toBeNull();

      JSON.parse = originalParse;
    });
  });

  describe('getDraftForCategory', () => {
    it('should return draft for matching category', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: 'Test',
        drawing: null,
        transcription: null
      });

      const result = draftManager.getDraftForCategory('grief');
      expect(result).not.toBeNull();
      expect(result?.categoryId).toBe('grief');
    });

    it('should return null for non-matching category', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: 'Test',
        drawing: null,
        transcription: null
      });

      const result = draftManager.getDraftForCategory('anger');
      expect(result).toBeNull();
    });
  });

  describe('archiveDraft', () => {
    it('should archive current draft to history', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: 'Test text to archive',
        drawing: null,
        transcription: null
      });

      draftManager.archiveDraft();

      const history = draftManager.getDraftHistory();
      expect(history.length).toBe(1);
      expect(history[0].text).toBe('Test text to archive');
    });

    it('should not archive empty drafts', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: '   ',
        drawing: null,
        transcription: null
      });

      draftManager.archiveDraft();

      const history = draftManager.getDraftHistory();
      expect(history.length).toBe(0);
    });

    it('should limit history to 20 drafts', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      // Create 25 drafts
      for (let i = 0; i < 25; i++) {
        vi.setSystemTime(new Date(2025, 0, 1, i, 0, 0));
        draftManager.saveDraft({
          categoryId: `cat_${i}`,
          categoryTitle: `Category ${i}`,
          text: `Draft ${i}`,
          drawing: null,
          transcription: null
        });
        draftManager.archiveDraft();
      }

      const history = draftManager.getDraftHistory();
      expect(history.length).toBe(20);
    });
  });

  describe('clearCurrentDraft', () => {
    it('should remove current draft from localStorage', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      draftManager.saveDraft({
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: 'Test',
        drawing: null,
        transcription: null
      });

      draftManager.clearCurrentDraft();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(CURRENT_DRAFT_KEY);
      expect(draftManager.getCurrentDraft()).toBeNull();
    });
  });

  describe('getDraftHistory', () => {
    it('should return empty array when no history exists', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const history = draftManager.getDraftHistory();
      expect(history).toEqual([]);
    });

    it('should return stored history', async () => {
      const historyData = [
        { id: 'draft_1', categoryId: 'grief', categoryTitle: 'Grief', text: 'Test 1', createdAt: 1, updatedAt: 1 }
      ];
      localStorageMock.setItem(DRAFTS_KEY, JSON.stringify(historyData));

      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const history = draftManager.getDraftHistory();
      expect(history.length).toBe(1);
    });
  });

  describe('deleteDraft', () => {
    it('should remove draft from history', async () => {
      const historyData = [
        { id: 'draft_1', categoryId: 'grief', categoryTitle: 'Grief', text: 'Test 1', createdAt: 1, updatedAt: 1 },
        { id: 'draft_2', categoryId: 'anger', categoryTitle: 'Anger', text: 'Test 2', createdAt: 2, updatedAt: 2 }
      ];
      localStorageMock.setItem(DRAFTS_KEY, JSON.stringify(historyData));

      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      draftManager.deleteDraft('draft_1');

      const history = draftManager.getDraftHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('draft_2');
    });
  });

  describe('isDraftStale', () => {
    it('should return false for recent draft', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const draft = {
        id: 'draft_1',
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: 'Test',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      expect(draftManager.isDraftStale(draft as any)).toBe(false);
    });

    it('should return true for draft older than 24 hours', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
      const draft = {
        id: 'draft_1',
        categoryId: 'grief',
        categoryTitle: 'Grief',
        text: 'Test',
        createdAt: twentyFiveHoursAgo,
        updatedAt: twentyFiveHoursAgo
      };

      expect(draftManager.isDraftStale(draft as any)).toBe(true);
    });
  });

  describe('getTimeSince', () => {
    it('should return "just now" for recent timestamps', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const now = Date.now();
      expect(draftManager.getTimeSince(now - 30000)).toBe('just now');
    });

    it('should return minutes for timestamps < 1 hour', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const now = Date.now();
      expect(draftManager.getTimeSince(now - 5 * 60 * 1000)).toBe('5m ago');
    });

    it('should return hours for timestamps < 24 hours', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const now = Date.now();
      expect(draftManager.getTimeSince(now - 3 * 60 * 60 * 1000)).toBe('3h ago');
    });

    it('should return days for timestamps >= 24 hours', async () => {
      vi.resetModules();
      const { draftManager } = await import('../../utils/draftManager');

      const now = Date.now();
      expect(draftManager.getTimeSince(now - 2 * 24 * 60 * 60 * 1000)).toBe('2d ago');
    });
  });
});
