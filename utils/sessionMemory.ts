
export interface EchoSession {
  id: string;
  timestamp: number;
  categoryId: string;
  categoryTitle: string;
  wordCount: number;
  hadAudio: boolean;
  hadImage: boolean;
}

export const sessionMemory = {
  save: (session: EchoSession) => {
    try {
        const existing = JSON.parse(localStorage.getItem('echoes_sessions') || '[]');
        existing.push(session);
        // Keep only last 10 sessions to respect privacy/storage
        const trimmed = existing.slice(-10);
        localStorage.setItem('echoes_sessions', JSON.stringify(trimmed));
    } catch (e) {
        console.error("Failed to save session", e);
    }
  },

  getHistory: (): EchoSession[] => {
    try {
        return JSON.parse(localStorage.getItem('echoes_sessions') || '[]');
    } catch {
        return [];
    }
  },

  getInsight: () => {
    const sessions = sessionMemory.getHistory();
    if (sessions.length === 0) return null;

    const lastSession = sessions[sessions.length - 1];
    const daysSince = Math.floor((Date.now() - lastSession.timestamp) / (1000 * 60 * 60 * 24));

    // Calculate most frequent category
    const counts: Record<string, number> = {};
    let mostCommonId = sessions[0].categoryId;
    let maxCount = 0;

    sessions.forEach(s => {
        counts[s.categoryId] = (counts[s.categoryId] || 0) + 1;
        if (counts[s.categoryId] > maxCount) {
            maxCount = counts[s.categoryId];
            mostCommonId = s.categoryId;
        }
    });

    return {
      isReturning: true,
      totalSessions: sessions.length,
      daysSinceLastVisit: daysSince,
      lastCategoryTitle: lastSession.categoryTitle,
      mostCommonCategoryId: mostCommonId
    };
  }
};
