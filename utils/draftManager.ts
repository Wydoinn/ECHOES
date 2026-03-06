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
    } catch {
      throw new Error('Failed to save draft');
    }
  },

  getCurrentDraft: (): DraftData | null => {
    try {
      const data = localStorage.getItem(CURRENT_DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getDraftForCategory: (categoryId: string): DraftData | null => {
    const draft = draftManager.getCurrentDraft();
    if (draft && draft.categoryId === categoryId) {
      return draft;
    }
    return null;
  },

  archiveDraft: (): void => {
    try {
      const current = draftManager.getCurrentDraft();
      if (current && current.text.trim().length > 0) {
        const history = draftManager.getDraftHistory();
        history.push(current);
        const trimmed = history.slice(-20);
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmed));
      }
    } catch { /* storage unavailable */ }
  },

  clearCurrentDraft: (): void => {
    try {
      localStorage.removeItem(CURRENT_DRAFT_KEY);
    } catch { /* storage unavailable */ }
  },

  getDraftHistory: (): DraftData[] => {
    try {
      return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    } catch {
      return [];
    }
  },

  deleteDraft: (draftId: string): void => {
    try {
      const history = draftManager.getDraftHistory();
      const filtered = history.filter(d => d.id !== draftId);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
    } catch { /* storage unavailable */ }
  },

  isDraftStale: (draft: DraftData): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - draft.updatedAt > twentyFourHours;
  },

  getTimeSince: (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
};
