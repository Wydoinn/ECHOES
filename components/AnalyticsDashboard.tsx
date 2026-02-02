/**
 * Personal Analytics Dashboard
 * Feature 14: Anonymous aggregate insights for users
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionMemory } from '../utils/sessionMemory';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icons
const Icons = {
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Heart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

const categoryColors: Record<string, string> = {
  'Grief': '#6b7280',
  'Regret': '#8b5cf6',
  'Anger': '#ef4444',
  'Fear': '#f97316',
  'Love': '#ec4899',
  'Gratitude': '#10b981',
  'Anxiety': '#f59e0b',
  'default': '#a78bfa'
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose }) => {
  // Re-fetch sessions each time the dashboard opens
  const sessions = useMemo(() => {
    if (!isOpen) return [];
    return sessionMemory.getHistory();
  }, [isOpen]);

  const analytics = useMemo(() => {
    if (sessions.length === 0) return null;

    // Basic stats
    const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0);
    const avgWords = Math.round(totalWords / sessions.length);
    const audioSessions = sessions.filter(s => s.hadAudio).length;
    const imageSessions = sessions.filter(s => s.hadImage).length;

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    const categoryWords: Record<string, number> = {};
    sessions.forEach(s => {
      categoryCount[s.categoryTitle] = (categoryCount[s.categoryTitle] || 0) + 1;
      categoryWords[s.categoryTitle] = (categoryWords[s.categoryTitle] || 0) + s.wordCount;
    });

    // Session frequency by day of week
    const dayOfWeekCount: number[] = new Array(7).fill(0) as number[];
    sessions.forEach(s => {
      const day = new Date(s.timestamp).getDay();
      dayOfWeekCount[day] = (dayOfWeekCount[day] ?? 0) + 1;
    });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mostActiveDay = dayNames[dayOfWeekCount.indexOf(Math.max(...dayOfWeekCount))];

    // Session frequency by hour
    const hourCount: number[] = new Array(24).fill(0) as number[];
    sessions.forEach(s => {
      const hour = new Date(s.timestamp).getHours();
      hourCount[hour] = (hourCount[hour] ?? 0) + 1;
    });
    const peakHour = hourCount.indexOf(Math.max(...hourCount));
    const peakTimeLabel = peakHour < 6 ? 'Night Owl 🦉' :
                         peakHour < 12 ? 'Morning Person 🌅' :
                         peakHour < 18 ? 'Afternoon Explorer 🌤️' : 'Evening Reflector 🌙';

    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);

    let prevDate: Date | null = null;
    let tempStreak = 0;

    sortedSessions.forEach(s => {
      const date = new Date(s.timestamp);
      date.setHours(0, 0, 0, 0);

      if (!prevDate) {
        tempStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date.getTime() === today.getTime()) {
          currentStreak = 1;
        }
      } else {
        const dayDiff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
          if (currentStreak > 0) currentStreak++;
        } else if (dayDiff > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          currentStreak = 0;
        }
      }
      prevDate = date;
    });
    longestStreak = Math.max(longestStreak, tempStreak);

    // Word count trend (compare last 5 to first 5)
    const firstFive = sessions.slice(0, 5);
    const lastFive = sessions.slice(-5);
    const firstAvg = firstFive.reduce((s, x) => s + x.wordCount, 0) / firstFive.length || 0;
    const lastAvg = lastFive.reduce((s, x) => s + x.wordCount, 0) / lastFive.length || 0;
    const wordTrend = lastAvg > firstAvg ? 'increasing' : lastAvg < firstAvg ? 'decreasing' : 'stable';

    return {
      totalSessions: sessions.length,
      totalWords,
      avgWords,
      audioSessions,
      imageSessions,
      categoryCount,
      categoryWords,
      mostActiveDay,
      peakTimeLabel,
      currentStreak,
      longestStreak,
      wordTrend
    };
  }, [sessions]);

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl max-h-[85vh] bg-gradient-to-b from-[#1a0b2e] to-[#0d0617] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif-display text-white/90 tracking-wider">Your Insights</h2>
                <p className="text-white/40 text-sm mt-1">A reflection on your journey</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <Icons.X />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {!analytics ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Icons.Heart />
                  <p className="text-white/30 mt-4 text-sm">Complete your first session to see insights</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Headline Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                      <div className="text-2xl font-bold text-purple-300">{analytics.totalSessions}</div>
                      <div className="text-xs text-white/40 mt-1">Total Sessions</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 rounded-xl p-4 border border-pink-500/20">
                      <div className="text-2xl font-bold text-pink-300">{analytics.totalWords.toLocaleString()}</div>
                      <div className="text-xs text-white/40 mt-1">Words Written</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-500/20">
                      <div className="text-2xl font-bold text-amber-300">{analytics.currentStreak}</div>
                      <div className="text-xs text-white/40 mt-1">Current Streak</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/20">
                      <div className="text-2xl font-bold text-emerald-300">{analytics.avgWords}</div>
                      <div className="text-xs text-white/40 mt-1">Avg. Words</div>
                    </div>
                  </div>

                  {/* Patterns */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                      <Icons.Zap /> Your Patterns
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-white/60">
                        <span>Most active day</span>
                        <span className="text-[#d4af37]">{analytics.mostActiveDay}</span>
                      </div>
                      <div className="flex items-center justify-between text-white/60">
                        <span>Reflection style</span>
                        <span className="text-[#d4af37]">{analytics.peakTimeLabel}</span>
                      </div>
                      <div className="flex items-center justify-between text-white/60">
                        <span>Word count trend</span>
                        <span className={`${
                          analytics.wordTrend === 'increasing' ? 'text-emerald-400' :
                          analytics.wordTrend === 'decreasing' ? 'text-rose-400' : 'text-white/40'
                        }`}>
                          {analytics.wordTrend === 'increasing' ? '📈 Growing' :
                           analytics.wordTrend === 'decreasing' ? '📉 Condensing' : '➡️ Steady'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-white/60">
                        <span>Longest streak</span>
                        <span className="text-[#d4af37]">{analytics.longestStreak} days</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                      <Icons.Heart /> Emotional Landscape
                    </h3>
                    <div className="space-y-2">
                      {(Object.entries(analytics.categoryCount) as [string, number][])
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, count]) => {
                          const percentage = Math.round((count / analytics.totalSessions) * 100);
                          const color = categoryColors[category] || categoryColors.default;
                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60">{category}</span>
                                <span className="text-white/40">{count} ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Media Usage */}
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                      <div className="text-2xl mb-1">🎤</div>
                      <div className="text-lg font-bold text-white/80">{analytics.audioSessions}</div>
                      <div className="text-xs text-white/40">Voice Notes</div>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                      <div className="text-2xl mb-1">🖼️</div>
                      <div className="text-lg font-bold text-white/80">{analytics.imageSessions}</div>
                      <div className="text-xs text-white/40">Images Shared</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsDashboard;
