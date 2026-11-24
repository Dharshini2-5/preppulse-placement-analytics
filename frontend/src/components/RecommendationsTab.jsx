import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { CountUp, PillNav, SpotlightCard, StarBorder } from './reactbits';

const PRIORITY_STYLES = {
  CRITICAL: 'border-rose-500/45 bg-rose-500/15 text-rose-300',
  HIGH: 'border-amber-500/45 bg-amber-500/15 text-amber-300',
  MEDIUM: 'border-cyan-500/45 bg-cyan-500/15 text-cyan-300',
  LOW: 'border-emerald-500/45 bg-emerald-500/15 text-emerald-300',
};

export function RecommendationsTab({ dashboard, onRefresh, onToast }) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [regenerating, setRegenerating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  if (!dashboard) return null;
  const { recommendations, readiness } = dashboard;

  const completedCount = recommendations.filter((r) => r.completed).length;
  const pendingImpact = recommendations
    .filter((r) => !r.completed)
    .reduce((acc, r) => acc + (r.estimatedImpactPoints || 0), 0);

  const visible =
    priorityFilter === 'ALL'
      ? recommendations
      : recommendations.filter((r) => r.priority === priorityFilter);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await api.generateRecommendations();
      await onRefresh();
      onToast('Personalized preparation workflow regenerated from your latest telemetry!');
    } catch (err) {
      onToast(err.message || 'Could not regenerate insights', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await api.toggleRecommendation(id);
      await onRefresh();
      onToast(
        res.recommendation.completed
          ? `Workflow milestone completed! Readiness Index updated to ${res.updatedReadiness.readinessIndex}`
          : 'Milestone marked back as active'
      );
    } catch (err) {
      onToast(err.message || 'Failed to update recommendation', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <SpotlightCard className="p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Analytics-Driven Recommendation Engine</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">
              Personalized Placement Preparation Workflows
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Synthesized directly from your weakest assessment domains, coding accuracy bottlenecks, trend slope, and{' '}
              <strong className="text-slate-200">{readiness.targetTier}</strong> benchmark gap. Completing items grants live Readiness Index credit.
            </p>
          </div>

          <StarBorder
            type="button"
            disabled={regenerating}
            onClick={handleRegenerate}
            innerClassName="px-5 py-3 text-sm whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-400 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Analyzing Telemetry...' : 'Regenerate Insights from Latest Data'}</span>
          </StarBorder>
        </div>

        {/* Summary KPI Strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Completed Milestones</div>
            <div className="mt-1 font-display text-2xl font-bold text-emerald-400">
              <CountUp to={completedCount} /> <span className="text-sm text-slate-500">/ {recommendations.length}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Unlockable Readiness Lift</div>
            <div className="mt-1 font-display text-2xl font-bold text-cyan-400">
              +<CountUp to={pendingImpact} decimals={1} suffix=" pts" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Active Workflow Boost Applied</div>
            <div className="mt-1 font-display text-2xl font-bold text-amber-400">
              +<CountUp to={readiness.recommendationBoost} decimals={1} suffix=" pts" />
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillNav
          layoutGroup="rec-priority"
          activeId={priorityFilter}
          onSelect={setPriorityFilter}
          items={[
            { id: 'ALL', label: `All (${recommendations.length})` },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'HIGH', label: 'High' },
            { id: 'MEDIUM', label: 'Medium' },
            { id: 'LOW', label: 'Low' },
          ]}
        />
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((rec) => {
          const prioClass = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.MEDIUM;
          return (
            <SpotlightCard
              key={rec.id}
              className={`p-5 transition-opacity ${rec.completed ? 'opacity-75 border-emerald-500/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${prioClass}`}>
                    {rec.priority}
                  </span>
                  <span className="rounded-md bg-slate-800/90 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                    {rec.category}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-300">
                  <Zap className="h-3.5 w-3.5" />+{rec.estimatedImpactPoints} pts
                </span>
              </div>

              <h3
                className={`mt-3 font-display text-lg font-bold ${
                  rec.completed ? 'line-through text-slate-400' : 'text-white'
                }`}
              >
                {rec.title}
              </h3>

              <div className="mt-3 rounded-xl border border-slate-800/90 bg-slate-950/65 p-3 text-xs leading-relaxed text-slate-300">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 block mb-1">
                  Diagnostic Rationale
                </span>
                {rec.rationale}
              </div>

              <div className="mt-3 text-xs leading-relaxed text-slate-300">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 block mb-1">
                  Action Plan
                </span>
                {rec.actionPlan}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                  {rec.resourceTag}
                </span>

                <button
                  type="button"
                  disabled={togglingId === rec.id}
                  onClick={() => handleToggle(rec.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    rec.completed
                      ? 'border-emerald-400/45 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                      : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-400/50 hover:text-emerald-300'
                  }`}
                >
                  {rec.completed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 text-slate-400" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
