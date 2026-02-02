/**
 * Session History Dashboard
 * Feature 10: Visual timeline of past emotional releases
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionMemory } from '../utils/sessionMemory';
import { draftManager, DraftData } from '../utils/draftManager';

interface SessionHistoryDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeDraft?: (draft: DraftData) => void;
}

// Icons
const Icons = {
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
  Mic: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/></svg>,
  Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const SessionHistoryDashboard: React.FC<SessionHistoryDashboardProps> = ({ isOpen, onClose, onResumeDraft }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'drafts'>('sessions');

  // eslint-disable-next-line react-hooks/exhaustive-deps -- Refresh data when dialog opens
  const sessions = useMemo(() => sessionMemory.getHistory().reverse(), [isOpen]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Refresh data when dialog opens
  const drafts = useMemo(() => draftManager.getDraftHistory().reverse(), [isOpen]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Refresh data when dialog opens
  const currentDraft = useMemo(() => draftManager.getCurrentDraft(), [isOpen]);

  const stats = useMemo(() => {
    const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0);
    const audioSessions = sessions.filter(s => s.hadAudio).length;
    const imageSessions = sessions.filter(s => s.hadImage).length;

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    sessions.forEach(s => {
      categoryCount[s.categoryTitle] = (categoryCount[s.categoryTitle] || 0) + 1;
    });

    const topCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalSessions: sessions.length,
      totalWords,
      audioSessions,
      imageSessions,
      topCategory: topCategory ? topCategory[0] : null
    };
  }, [sessions]);

  const handleDeleteDraft = (id: string) => {
    draftManager.deleteDraft(id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-gradient-to-b from-[#1a0b2e] to-[#0d0617] border-l border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif-display text-white/90 tracking-wider">Your Journey</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                  <Icons.X />
                </button>
              </div>

              {/* Stats Strip */}
              {sessions.length > 0 && (
                <div className="flex gap-4 text-xs">
                  <div className="bg-white/5 rounded-lg px-3 py-2 flex-1">
                    <div className="text-[#d4af37] font-medium">{stats.totalSessions}</div>
                    <div className="text-white/40">sessions</div>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-2 flex-1">
                    <div className="text-purple-400 font-medium">{stats.totalWords.toLocaleString()}</div>
                    <div className="text-white/40">words written</div>
                  </div>
                  {stats.topCategory && (
                    <div className="bg-white/5 rounded-lg px-3 py-2 flex-1">
                      <div className="text-pink-400 font-medium truncate">{stats.topCategory}</div>
                      <div className="text-white/40">most explored</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex-1 py-3 text-sm tracking-wider transition-colors ${
                  activeTab === 'sessions'
                    ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Sessions ({sessions.length})
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`flex-1 py-3 text-sm tracking-wider transition-colors relative ${
                  activeTab === 'drafts'
                    ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Drafts ({drafts.length + (currentDraft ? 1 : 0)})
                {currentDraft && (
                  <span className="absolute top-2 right-[30%] w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-220px)] p-4 space-y-3">
              {activeTab === 'sessions' ? (
                sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Icons.Sparkles />
                    <p className="text-white/30 mt-4 text-sm">Your journey begins with your first session</p>
                  </div>
                ) : (
                  sessions.map((session, idx) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white/80 font-medium">{session.categoryTitle}</div>
                          <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                            <span className="flex items-center gap-1">
                              <Icons.Clock />
                              {formatDate(session.timestamp)} • {formatTime(session.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs">
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          {session.wordCount} words
                        </span>
                        {session.hadAudio && (
                          <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full flex items-center gap-1">
                            <Icons.Mic /> Audio
                          </span>
                        )}
                        {session.hadImage && (
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex items-center gap-1">
                            <Icons.Image /> Image
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )
              ) : (
                <>
                  {/* Current Draft */}
                  {currentDraft && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/30"
                    >
                      <div className="flex items-center gap-2 text-green-400 text-xs mb-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        ACTIVE DRAFT
                      </div>
                      <div className="text-white/80 font-medium">{currentDraft.categoryTitle}</div>
                      <p className="text-white/40 text-sm mt-2 line-clamp-2">
                        {currentDraft.text.slice(0, 150)}{currentDraft.text.length > 150 ? '...' : ''}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-white/30">
                          Updated {draftManager.getTimeSince(currentDraft.updatedAt)}
                        </span>
                        {onResumeDraft && (
                          <button
                            onClick={() => onResumeDraft(currentDraft)}
                            className="flex items-center gap-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Icons.Play /> Resume
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Draft History */}
                  {drafts.length === 0 && !currentDraft ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Icons.FileText />
                      <p className="text-white/30 mt-4 text-sm">No saved drafts yet</p>
                    </div>
                  ) : (
                    drafts.map((draft, idx) => (
                      <motion.div
                        key={draft.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-white/80 font-medium">{draft.categoryTitle}</div>
                            <p className="text-white/40 text-sm mt-1 line-clamp-2">
                              {draft.text.slice(0, 100)}{draft.text.length > 100 ? '...' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-white/30">
                            {formatDate(draft.createdAt)}
                          </span>
                          <span className="text-xs text-white/40">
                            {draft.text.trim().split(/\s+/).length} words
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionHistoryDashboard;
