/**
 * Draft Manager - Auto-save and Resume Drafts
 * Feature 10: Progress Saving
 */

export interface DraftData {
  id: string;
  categoryId: string;
  categoryTitle: string;
  text: string;
  drawing?: string | null;
  transcription?: string | null;
  createdAt: number;
  updatedAt: number;
}

const DRAFTS_KEY = 'echoes_drafts';
const CURRENT_DRAFT_KEY = 'echoes_current_draft';

export const draftManager = {
  /**
   * Save a draft to localStorage
   */
  saveDraft: (draft: Omit<DraftData, 'id' | 'createdAt' | 'updatedAt'>): DraftData => {
    try {
      const existing = draftManager.getCurrentDraft();
      const now = Date.now();

      const draftData: DraftData = {
        id: existing?.categoryId === draft.categoryId ? existing.id : `draft_${now}`,
        ...draft,
        createdAt: existing?.categoryId === draft.categoryId ? existing.createdAt : now,
        updatedAt: now
      };

      localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(draftData));
      return draftData;
    } catch (e) {
      console.error('Failed to save draft:', e);
      throw e;
    }
  },

  /**
   * Get the current active draft
   */
  getCurrentDraft: (): DraftData | null => {
    try {
      const data = localStorage.getItem(CURRENT_DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if there's a draft for a specific category
   */
  getDraftForCategory: (categoryId: string): DraftData | null => {
    const draft = draftManager.getCurrentDraft();
    if (draft && draft.categoryId === categoryId) {
      return draft;
    }
    return null;
  },

  /**
   * Archive current draft to history before clearing
   */
  archiveDraft: (): void => {
    try {
      const current = draftManager.getCurrentDraft();
      if (current && current.text.trim().length > 0) {
        const history = draftManager.getDraftHistory();
        history.push(current);
        // Keep last 20 drafts
        const trimmed = history.slice(-20);
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmed));
      }
    } catch (e) {
      console.error('Failed to archive draft:', e);
    }
  },

  /**
   * Clear current draft
   */
  clearCurrentDraft: (): void => {
    try {
      localStorage.removeItem(CURRENT_DRAFT_KEY);
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  },

  /**
   * Get draft history
   */
  getDraftHistory: (): DraftData[] => {
    try {
      return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Delete a draft from history
   */
  deleteDraft: (draftId: string): void => {
    try {
      const history = draftManager.getDraftHistory();
      const filtered = history.filter(d => d.id !== draftId);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete draft:', e);
    }
  },

  /**
   * Check if draft is stale (older than 24 hours)
   */
  isDraftStale: (draft: DraftData): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - draft.updatedAt > twentyFourHours;
  },

  /**
   * Get time since last update in human readable format
   */
  getTimeSince: (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
};
