import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, SlidersHorizontal, Sparkles, Target } from 'lucide-react';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { getChartTheme } from '../lib/chartTheme';
import { BorderBeam, CountUp, PillNav, SpotlightCard, StarBorder } from './reactbits';

export function SimulatorTab({ dashboard, onToast }) {
  const { isDark } = useTheme();
  const chart = getChartTheme(isDark);
  const [params, setParams] = useState({
    targetMockScore: 90,
    extraMediumProblems: 20,
    extraHardProblems: 10,
    coreCsBoostPercent: 8,
    weeksHorizon: 6,
    targetTier: dashboard?.readiness?.targetTier || 'FAANG',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (payload = params) => {
    setLoading(true);
    try {
      const res = await api.simulateReadiness(payload);
      setResult(res);
    } catch (err) {
      onToast?.(err.message || 'Simulation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key, val) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Controls Panel */}
        <SpotlightCard className="p-6 lg:col-span-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">What-If Readiness Simulator</h3>
              <p className="text-xs text-slate-400">
                Tune your upcoming preparation sprint via live Spring Boot modeling
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-medium text-slate-300">Target Placement Tier</div>
              <PillNav
                layoutGroup="sim-tier"
                activeId={params.targetTier}
                onSelect={(id) => {
                  const next = { ...params, targetTier: id };
                  setParams(next);
                  runSimulation(next);
                }}
                items={[
                  { id: 'SERVICE', label: 'Service (65)' },
                  { id: 'PRODUCT', label: 'Product (78)' },
                  { id: 'FAANG', label: 'FAANG (88)' },
                ]}
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-300">Target Mock Assessment Score</span>
                <span className="font-mono font-bold text-emerald-400">{params.targetMockScore}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                value={params.targetMockScore}
                onChange={(e) => updateField('targetMockScore', Number(e.target.value))}
                className="preppulse-slider w-full"
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-300">Additional Medium Coding Problems</span>
                <span className="font-mono font-bold text-amber-300">+{params.extraMediumProblems}</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={params.extraMediumProblems}
                onChange={(e) => updateField('extraMediumProblems', Number(e.target.value))}
                className="preppulse-slider w-full"
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-300">Additional Hard Coding Problems</span>
                <span className="font-mono font-bold text-rose-300">+{params.extraHardProblems}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={params.extraHardProblems}
                onChange={(e) => updateField('extraHardProblems', Number(e.target.value))}
                className="preppulse-slider w-full"
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-300">Core CS / System Design Mastery Lift</span>
                <span className="font-mono font-bold text-cyan-300">+{params.coreCsBoostPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={params.coreCsBoostPercent}
                onChange={(e) => updateField('coreCsBoostPercent', Number(e.target.value))}
                className="preppulse-slider w-full"
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-300">Preparation Horizon</span>
                <span className="font-mono font-bold text-white">{params.weeksHorizon} Weeks</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={params.weeksHorizon}
                onChange={(e) => updateField('weeksHorizon', Number(e.target.value))}
                className="preppulse-slider w-full"
              />
            </div>

            <StarBorder
              type="button"
              disabled={loading}
              onClick={() => runSimulation(params)}
              className="w-full"
              innerClassName="w-full py-3 text-sm"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{loading ? 'Running Predictive Model...' : 'Run Readiness Projection'}</span>
            </StarBorder>
          </div>
        </SpotlightCard>

        {/* Results Panel with BorderBeam */}
        <div className="lg:col-span-7 space-y-6">
          <BorderBeam duration="7s" innerClassName="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  Simulated Placement Readiness Outcome
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-5xl font-bold text-white">
                    <CountUp to={result?.projectedReadiness ?? dashboard?.readiness?.readinessIndex ?? 0} decimals={1} />
                  </span>
                  <span className="rounded-lg bg-emerald-500/15 border border-emerald-400/35 px-2.5 py-1 font-mono text-sm font-bold text-emerald-300">
                    +<CountUp to={result?.delta ?? 0} decimals={1} /> pts
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                    result?.achievesTarget
                      ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-300'
                      : 'border-amber-400/45 bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {result?.achievesTarget ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Clears {result.targetTier} Benchmark ({result.targetBenchmark})</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span>{result?.remainingGap ?? 0} pts below {result?.targetTier} ({result?.targetBenchmark})</span>
                    </>
                  )}
                </div>
                <div className="mt-1.5 text-xs font-mono text-slate-400">
                  Projected Band: <span className="text-white">{result?.projectedBand || '—'}</span>
                </div>
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 text-sm leading-relaxed text-slate-300">
              {result?.projectionNarrative || 'Adjust the sliders and run projection to preview your sprint impact.'}
            </p>

            {/* Weekly Trajectory Chart */}
            <div className="mt-6">
              <div className="mb-3 text-xs font-mono uppercase tracking-wider text-slate-400">
                Projected Weekly Trajectory vs {params.targetTier} Benchmark
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result?.weeklyTrajectory || []} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                    <XAxis dataKey="week" stroke={chart.axisStroke} fontSize={12} />
                    <YAxis domain={[50, 100]} stroke={chart.axisStroke} fontSize={12} />
                    <Tooltip
                      contentStyle={chart.tooltipStyle}
                      itemStyle={chart.tooltipItemStyle}
                      labelStyle={chart.tooltipLabelStyle}
                    />
                    <Legend wrapperStyle={chart.legendStyle} />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      name="Projected Readiness"
                      stroke={chart.primaryEmerald}
                      strokeWidth={3}
                      dot={{ r: 4, fill: chart.primaryEmerald }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      name={`${params.targetTier} Benchmark`}
                      stroke={chart.primaryAmber}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </BorderBeam>
        </div>
      </div>
    </div>
  );
}
