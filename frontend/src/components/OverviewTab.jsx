import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Award,
  CheckCircle2,
  Code2,
  Flame,
  MessageSquareQuote,
  Target,
  TrendingUp,
} from 'lucide-react';
import { AnimatedList, BorderBeam, CountUp, PillNav, SpotlightCard } from './reactbits';
import { ReadinessGauge } from './ReadinessGauge';
import { useTheme } from '../context/ThemeContext';
import { getChartTheme } from '../lib/chartTheme';

export function OverviewTab({ dashboard, onUpdateTargetTier, onNavigate }) {
  const { isDark } = useTheme();
  const chart = getChartTheme(isDark);
  if (!dashboard) return null;
  const { user, readiness, skillSnapshots, assessments, radarSkills, mentorFeedback } = dashboard;

  const factors = [
    { label: 'Weighted Assessments', value: readiness.assessmentComponent, max: 35, color: 'bg-emerald-400' },
    { label: 'Difficulty-Weighted Coding', value: readiness.codingComponent, max: 30, color: 'bg-cyan-400' },
    { label: 'Skill Progression & Core CS', value: readiness.skillProgressionComponent, max: 15, color: 'bg-sky-400' },
    { label: 'Assessment Momentum Slope', value: readiness.momentumBonus, max: 10, color: 'bg-amber-400' },
    { label: 'CGPA & Mock Baseline', value: readiness.academicMockComponent, max: 10, color: 'bg-violet-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Readiness Score + Factor Decomposition */}
      <BorderBeam duration="9s" innerClassName="p-6">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="flex flex-col items-center lg:col-span-4 lg:border-r lg:border-slate-800/80 lg:pr-6">
            <ReadinessGauge
              score={readiness.readinessIndex}
              band={readiness.readinessBand}
              targetTier={readiness.targetTier}
            />
            <div className="mt-4 w-full text-center">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Switch Target Placement Tier
              </div>
              <PillNav
                layoutGroup="target-tier"
                activeId={readiness.targetTier}
                onSelect={onUpdateTargetTier}
                items={[
                  { id: 'SERVICE', label: 'Service (65)' },
                  { id: 'PRODUCT', label: 'Product (78)' },
                  { id: 'FAANG', label: 'FAANG (88)' },
                ]}
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Dynamic 5-Factor Scoring Decomposition
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">
                  {user.fullName} — {user.department} ({user.batchYear})
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  CGPA <strong className="text-slate-200">{user.cgpa}</strong> •{' '}
                  {readiness.gapToTarget > 0 ? (
                    <span>
                      <strong className="text-amber-300">{readiness.gapToTarget} pts</strong> away from{' '}
                      <strong className="text-white">{readiness.targetTier}</strong> benchmark ({readiness.targetBenchmark})
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-semibold">
                      Exceeds {readiness.targetTier} placement benchmark ({readiness.targetBenchmark})!
                    </span>
                  )}
                </p>
              </div>
              {readiness.recommendationBoost > 0 && (
                <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-mono text-emerald-300">
                  +{readiness.recommendationBoost} pts Prep Workflow Boost
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {factors.map((f) => {
                const pct = Math.min(100, (f.value / f.max) * 100);
                return (
                  <div key={f.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{f.label}</span>
                      <span className="font-mono text-slate-200">
                        {f.value} <span className="text-slate-500">/ {f.max}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/90">
                      <div
                        className={`h-full rounded-full ${f.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Target Tier Gap Pills */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {readiness.tierGaps.map((tg) => (
                <div
                  key={tg.tier}
                  className={`rounded-xl border px-3.5 py-2.5 text-xs ${
                    tg.achieved
                      ? 'border-emerald-500/35 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{tg.tier}</span>
                    {tg.achieved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <span className="font-mono text-amber-300">-{tg.gap} pts</span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">Benchmark: {tg.benchmark}/100</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BorderBeam>

      {/* 4 Animated KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Problems Solved</span>
            <Code2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-white">
            <CountUp to={readiness.totalProblemsSolved} />
          </div>
          <div className="mt-1 text-xs font-mono text-emerald-300">
            {readiness.codingAccuracyAvg}% Avg Accuracy
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5" spotlightColor="rgba(6, 182, 212, 0.22)">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Weighted Assessment Avg</span>
            <Award className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-white">
            <CountUp to={readiness.assessmentAverage} decimals={1} suffix="%" />
          </div>
          <div className="mt-1 text-xs font-mono text-cyan-300">
            {assessments.length} Graded Assessments
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5" spotlightColor="rgba(245, 158, 11, 0.22)">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recent Trend Momentum</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-white">
            <CountUp
              to={readiness.trendSlope}
              decimals={2}
              prefix={readiness.trendSlope >= 0 ? '+' : ''}
            />
          </div>
          <div className="mt-1 text-xs font-mono text-amber-300">pts / recent assessment</div>
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Peak Weekly Streak</span>
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-white">
            <CountUp to={readiness.maxWeeklyStreak} suffix=" wks" />
          </div>
          <div className="mt-1 text-xs font-mono text-slate-400">
            {readiness.codingWeightedPoints} weighted coding pts
          </div>
        </SpotlightCard>
      </div>

      {/* Charts Row: 8-Week Progression AreaChart + Skill Mastery RadarChart */}
      <div className="grid gap-6 lg:grid-cols-12">
        <SpotlightCard className="p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                8-Week Readiness & Skill Progression
              </h3>
              <p className="text-xs text-slate-400">
                Historical trajectory across Readiness Index, DSA, Aptitude & Core CS
              </p>
            </div>
            <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
              LIVE TIMELINE
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={skillSnapshots} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDsa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis dataKey="weekLabel" stroke={chart.axisStroke} fontSize={12} />
                <YAxis domain={[45, 100]} stroke={chart.axisStroke} fontSize={12} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  itemStyle={chart.tooltipItemStyle}
                  labelStyle={chart.tooltipLabelStyle}
                />
                <Legend wrapperStyle={chart.legendStyle} />
                <Area
                  type="monotone"
                  dataKey="readinessIndex"
                  name="Readiness Index"
                  stroke={chart.primaryEmerald}
                  strokeWidth={2.6}
                  fill="url(#gradReadiness)"
                />
                <Area
                  type="monotone"
                  dataKey="dsaScore"
                  name="DSA Score"
                  stroke={chart.primaryCyan}
                  strokeWidth={2}
                  fill="url(#gradDsa)"
                />
                <Area
                  type="monotone"
                  dataKey="coreCsScore"
                  name="Core CS"
                  stroke={chart.primaryAmber}
                  strokeWidth={1.8}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 lg:col-span-5" spotlightColor="rgba(6, 182, 212, 0.2)">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Skill Mastery Radar</h3>
              <p className="text-xs text-slate-400">
                Current competency vs {readiness.targetTier} benchmark
              </p>
            </div>
            <Target className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSkills}>
                <PolarGrid stroke={chart.polarGridStroke} />
                <PolarAngleAxis dataKey="skill" tick={{ fill: chart.radarAngleFill, fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: chart.radarRadiusFill, fontSize: 10 }} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  itemStyle={chart.tooltipItemStyle}
                  labelStyle={chart.tooltipLabelStyle}
                />
                <Radar
                  name="Your Score"
                  dataKey="score"
                  stroke={chart.primaryEmerald}
                  fill={chart.primaryEmerald}
                  fillOpacity={isDark ? 0.35 : 0.24}
                />
                <Radar
                  name={`${readiness.targetTier} Target`}
                  dataKey="benchmark"
                  stroke={chart.primaryAmber}
                  fill={chart.primaryAmber}
                  fillOpacity={0.12}
                  strokeDasharray="4 4"
                />
                <Legend wrapperStyle={chart.legendStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Bottom Row: Recent Assessments AnimatedList + Mentor Feedback */}
      <div className="grid gap-6 lg:grid-cols-12">
        <SpotlightCard className="p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Recent Assessments</h3>
              <p className="text-xs text-slate-400">Latest evaluated placement tests & mock interviews</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('assessments')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              Log / View All →
            </button>
          </div>
          <AnimatedList
            items={assessments.slice(0, 5)}
            renderItem={(a) => (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{a.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                      {a.category}
                    </span>
                    <span>{a.takenAt}</span>
                    <span>• {a.difficulty}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-base font-bold text-emerald-400">{a.percentage}%</div>
                  <div className="text-[11px] font-mono text-slate-500">P{Math.round(a.percentile)}</div>
                </div>
              </div>
            )}
          />
        </SpotlightCard>

        <SpotlightCard className="p-5 lg:col-span-5" spotlightColor="rgba(245, 158, 11, 0.2)">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Mentor Coaching Notes</h3>
              <p className="text-xs text-slate-400">Direct qualitative insights from Placement Cell</p>
            </div>
            <MessageSquareQuote className="h-4 w-4 text-amber-400" />
          </div>
          <AnimatedList
            items={mentorFeedback}
            emptyMessage="No mentor notes posted yet. Mentors can add coaching notes in the Cohort & RBAC tab."
            renderItem={(fb) => (
              <div className="p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-300">{fb.mentorName}</span>
                  <span className="rounded bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] text-amber-200">
                    {fb.focusArea}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{fb.note}</p>
              </div>
            )}
          />
        </SpotlightCard>
      </div>
    </div>
  );
}
