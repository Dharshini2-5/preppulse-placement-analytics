import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Bell,
  CheckCheck,
  Flame,
  MessageSquareQuote,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function NotificationsDrawer({
  open,
  onClose,
  dashboard,
  currentUser,
  sessionNotifications = [],
  readIds = [],
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  apiHealth,
}) {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const contextualItems = useMemo(() => {
    const items = [];
    const readiness = dashboard?.readiness;
    const recs = dashboard?.recommendations || [];
    const feedback = dashboard?.mentorFeedback || [];

    if (readiness) {
      if (readiness.gapToTarget > 0) {
        items.push({
          id: `ctx-gap-${readiness.targetTier}`,
          title: `${readiness.gapToTarget} pts to ${readiness.targetTier} Benchmark`,
          message: `Current Readiness Index is ${readiness.readinessIndex}/100 (${readiness.readinessBand}). Open the What-If Simulator to model a sprint plan.`,
          time: 'Live Telemetry',
          category: 'READINESS',
          tone: 'amber',
          icon: Target,
          targetTab: 'simulator',
        });
      } else {
        items.push({
          id: `ctx-achieved-${readiness.targetTier}`,
          title: `${readiness.targetTier} Benchmark Achieved!`,
          message: `You are scoring ${readiness.readinessIndex}/100, exceeding the ${readiness.targetBenchmark} benchmark. Ready for final mock drives.`,
          time: 'Live Telemetry',
          category: 'MILESTONE',
          tone: 'emerald',
          icon: Sparkles,
          targetTab: 'overview',
        });
      }

      if (readiness.maxWeeklyStreak >= 4) {
        items.push({
          id: `ctx-streak-${readiness.maxWeeklyStreak}`,
          title: `${readiness.maxWeeklyStreak}-Week Consistency Streak Active`,
          message: `${readiness.totalProblemsSolved} problems solved with ${readiness.codingAccuracyAvg}% accuracy contributing ${readiness.codingComponent}/30 coding readiness pts.`,
          time: 'Coding Engine',
          category: 'STREAK',
          tone: 'cyan',
          icon: Flame,
          targetTab: 'assessments',
        });
      }
    }

    const highRecs = recs.filter((r) => !r.completed && (r.priority === 'CRITICAL' || r.priority === 'HIGH'));
    if (highRecs.length > 0) {
      items.push({
        id: `ctx-recs-${highRecs.length}`,
        title: `${highRecs.length} High-Priority Prep Workflow${highRecs.length > 1 ? 's' : ''} Pending`,
        message: `Top action: "${highRecs[0].title}" (+${highRecs[0].estimatedImpactPoints} pts estimated Readiness lift).`,
        time: 'AI Engine',
        category: 'WORKFLOW',
        tone: 'emerald',
        icon: Sparkles,
        targetTab: 'recommendations',
      });
    }

    if (feedback.length > 0) {
      const latest = feedback[0];
      items.push({
        id: `ctx-feedback-${latest.id || 'latest'}`,
        title: `Mentor Note from ${latest.mentorName}`,
        message: `${latest.focusArea}: ${latest.note}`,
        time: 'Placement Cell',
        category: 'COACHING',
        tone: 'amber',
        icon: MessageSquareQuote,
        targetTab: 'overview',
      });
    }

    items.push({
      id: 'ctx-api-health',
      title: apiHealth?.online ? 'Spring Boot Telemetry Online' : 'Backend Health Check Pending',
      message: apiHealth?.online
        ? `Connected to :8081 REST API (${apiHealth.latencyMs}ms latency) as ${currentUser?.role || 'GUEST'}.`
        : 'Waiting for Spring Boot API on http://localhost:8081/api/health.',
      time: 'System',
      category: 'SYSTEM',
      tone: apiHealth?.online ? 'cyan' : 'rose',
      icon: Activity,
      targetTab: 'settings',
    });

    return [...sessionNotifications, ...items];
  }, [dashboard, currentUser, sessionNotifications, apiHealth]);

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const unreadCount = contextualItems.filter((item) => !readSet.has(item.id)).length;
  const visible =
    filter === 'unread'
      ? contextualItems.filter((item) => !readSet.has(item.id))
      : contextualItems;

  const toneBadge = {
    emerald: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    cyan: 'border-cyan-500/35 bg-cyan-500/12 text-cyan-700 dark:text-cyan-300',
    amber: 'border-amber-500/35 bg-amber-500/12 text-amber-700 dark:text-amber-300',
    rose: 'border-rose-500/35 bg-rose-500/12 text-rose-700 dark:text-rose-300',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 z-[140] flex justify-end backdrop-blur-sm ${
            isDark ? 'bg-slate-950/65' : 'bg-slate-900/25'
          }`}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className={`flex h-full w-full max-w-md flex-col border-l shadow-2xl ${
              isDark
                ? 'border-slate-800 bg-[#070D1D]/96 text-slate-100'
                : 'border-slate-200 bg-white/97 text-slate-900'
            } backdrop-blur-2xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Activity & Alerts
                  </h2>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {unreadCount} unread intelligence notification{unreadCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter & Mark All Read */}
            <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-2.5">
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                    filter === 'all'
                      ? 'bg-emerald-500/18 text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({contextualItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                    filter === 'unread'
                      ? 'bg-emerald-500/18 text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <button
                type="button"
                disabled={unreadCount === 0}
                onClick={() => onMarkAllRead(contextualItems.map((i) => i.id))}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 transition hover:underline disabled:opacity-40 cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            </div>

            {/* Feed List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 py-14 text-center">
                  <CheckCheck className="h-8 w-8 text-emerald-500/60" />
                  <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    All caught up!
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    New readiness alerts & workflow completions will appear here.
                  </p>
                </div>
              ) : (
                visible.map((item) => {
                  const Icon = item.icon || Bell;
                  const isUnread = !readSet.has(item.id);
                  const badgeStyle = toneBadge[item.tone] || toneBadge.emerald;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onMarkRead(item.id);
                        if (item.targetTab) {
                          onNavigate(item.targetTab);
                          onClose();
                        }
                      }}
                      className={`group relative w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
                        isUnread
                          ? isDark
                            ? 'border-emerald-500/30 bg-slate-900/90 hover:border-emerald-400/50'
                            : 'border-emerald-500/25 bg-emerald-50/40 hover:bg-emerald-50/75 shadow-2xs'
                          : isDark
                          ? 'border-slate-800/80 bg-slate-900/45 opacity-80 hover:opacity-100'
                          : 'border-slate-200/80 bg-white opacity-85 hover:opacity-100'
                      }`}
                    >
                      {isUnread && (
                        <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${badgeStyle}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-400">• {item.time}</span>
                          </div>
                          <div className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
