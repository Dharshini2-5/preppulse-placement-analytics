import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Code2, PlusCircle, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { getChartTheme } from '../lib/chartTheme';
import { PillNav, SpotlightCard, StarBorder } from './reactbits';

const CATEGORIES = [
  { value: 'DSA_CODING', label: 'DSA & Competitive Coding' },
  { value: 'APTITUDE', label: 'Quantitative & Logical Aptitude' },
  { value: 'CORE_CS', label: 'Core CS (OS, CN, OOP)' },
  { value: 'SQL_DBMS', label: 'SQL, Indexing & DBMS' },
  { value: 'SYSTEM_DESIGN', label: 'System Design & Architecture' },
  { value: 'MOCK_INTERVIEW', label: 'Technical & HR Mock Interview' },
];

const TOPICS = [
  'Arrays & Hashing',
  'Trees & Graphs',
  'Dynamic Programming',
  'Sliding Window',
  'SQL & Joins',
  'System Design',
  'OOP & Java',
  'OS & Networking',
];

export function AssessmentsCodingTab({ dashboard, onRefresh, onToast }) {
  const { isDark } = useTheme();
  const chart = getChartTheme(isDark);
  const [filterCat, setFilterCat] = useState('ALL');
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [submittingCoding, setSubmittingCoding] = useState(false);

  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    category: 'DSA_CODING',
    score: 84,
    maxScore: 100,
    timeTakenMinutes: 60,
    difficulty: 'MEDIUM',
  });

  const [codingForm, setCodingForm] = useState({
    topic: 'Dynamic Programming',
    easySolved: 16,
    mediumSolved: 38,
    hardSolved: 19,
    accuracyRate: 78.5,
    avgSolveMinutes: 30,
    weeklyStreak: 10,
  });

  if (!dashboard) return null;
  const { assessments, codingActivities, categoryAverages } = dashboard;

  const filteredAssessments =
    filterCat === 'ALL'
      ? assessments
      : assessments.filter((a) => a.category === filterCat);

  const handleLogAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentForm.title.trim()) return;
    setSubmittingAssessment(true);
    try {
      await api.addAssessment({
        ...assessmentForm,
        score: Number(assessmentForm.score),
        maxScore: Number(assessmentForm.maxScore),
        timeTakenMinutes: Number(assessmentForm.timeTakenMinutes),
      });
      setAssessmentForm((prev) => ({ ...prev, title: '' }));
      await onRefresh();
      onToast('Assessment logged & Readiness Index recalculated!');
    } catch (err) {
      onToast(err.message || 'Failed to log assessment', 'error');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const handleDeleteAssessment = async (id) => {
    try {
      await api.deleteAssessment(id);
      await onRefresh();
      onToast('Assessment removed & Readiness updated');
    } catch (err) {
      onToast(err.message || 'Could not remove assessment', 'error');
    }
  };

  const handleUpsertCoding = async (e) => {
    e.preventDefault();
    setSubmittingCoding(true);
    try {
      await api.upsertCodingActivity({
        topic: codingForm.topic,
        easySolved: Number(codingForm.easySolved),
        mediumSolved: Number(codingForm.mediumSolved),
        hardSolved: Number(codingForm.hardSolved),
        accuracyRate: Number(codingForm.accuracyRate),
        avgSolveMinutes: Number(codingForm.avgSolveMinutes),
        weeklyStreak: Number(codingForm.weeklyStreak),
      });
      await onRefresh();
      onToast(`Updated "${codingForm.topic}" coding telemetry & Readiness Index!`);
    } catch (err) {
      onToast(err.message || 'Failed to update coding stats', 'error');
    } finally {
      setSubmittingCoding(false);
    }
  };

  const prefillTopic = (item) => {
    setCodingForm({
      topic: item.topic,
      easySolved: item.easySolved,
      mediumSolved: item.mediumSolved,
      hardSolved: item.hardSolved,
      accuracyRate: item.accuracyRate,
      avgSolveMinutes: item.avgSolveMinutes,
      weeklyStreak: item.weeklyStreak,
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Input Forms Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpotlightCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="font-display text-lg font-bold text-white">Log Placement Assessment</h3>
              <p className="text-xs text-slate-400">
                Persists to DB and recalculates Readiness Index & Trend Slope in real time
              </p>
            </div>
          </div>

          <form onSubmit={handleLogAssessment} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-300">Assessment Title</label>
              <input
                type="text"
                required
                value={assessmentForm.title}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                placeholder="e.g. Amazon OA Timed Graph & Heap Mock"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Category</label>
                <select
                  value={assessmentForm.category}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-emerald-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Difficulty</label>
                <select
                  value={assessmentForm.difficulty}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, difficulty: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Score</label>
                <input
                  type="number"
                  min="0"
                  max={assessmentForm.maxScore}
                  step="0.5"
                  required
                  value={assessmentForm.score}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, score: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Max Score</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={assessmentForm.maxScore}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, maxScore: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Time (min)</label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={assessmentForm.timeTakenMinutes}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, timeTakenMinutes: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="pt-1">
              <StarBorder
                type="submit"
                disabled={submittingAssessment}
                className="w-full"
                innerClassName="w-full py-2.5 text-sm"
              >
                {submittingAssessment ? 'Recording...' : 'Save Assessment & Recalculate Readiness'}
              </StarBorder>
            </div>
          </form>
        </SpotlightCard>

        <SpotlightCard className="p-5" spotlightColor="rgba(6, 182, 212, 0.22)">
          <div className="mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="font-display text-lg font-bold text-white">Update Coding Topic Telemetry</h3>
              <p className="text-xs text-slate-400">
                Click any topic chip below or select a domain to update solved volume & accuracy
              </p>
            </div>
          </div>

          <form onSubmit={handleUpsertCoding} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Coding Domain</label>
                <select
                  value={codingForm.topic}
                  onChange={(e) => {
                    const found = codingActivities.find((c) => c.topic === e.target.value);
                    if (found) prefillTopic(found);
                    else setCodingForm({ ...codingForm, topic: e.target.value });
                  }}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Weekly Streak</label>
                <input
                  type="number"
                  min="0"
                  max="52"
                  value={codingForm.weeklyStreak}
                  onChange={(e) => setCodingForm({ ...codingForm, weeklyStreak: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-emerald-300">Easy Solved</label>
                <input
                  type="number"
                  min="0"
                  value={codingForm.easySolved}
                  onChange={(e) => setCodingForm({ ...codingForm, easySolved: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-amber-300">Medium Solved</label>
                <input
                  type="number"
                  min="0"
                  value={codingForm.mediumSolved}
                  onChange={(e) => setCodingForm({ ...codingForm, mediumSolved: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-rose-300">Hard Solved</label>
                <input
                  type="number"
                  min="0"
                  value={codingForm.hardSolved}
                  onChange={(e) => setCodingForm({ ...codingForm, hardSolved: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Accuracy Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={codingForm.accuracyRate}
                  onChange={(e) => setCodingForm({ ...codingForm, accuracyRate: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Avg Solve Time (min)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  step="0.5"
                  value={codingForm.avgSolveMinutes}
                  onChange={(e) => setCodingForm({ ...codingForm, avgSolveMinutes: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submittingCoding}
                className="w-full rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-500/30 hover:to-emerald-500/30 cursor-pointer disabled:opacity-50"
              >
                {submittingCoding ? 'Syncing Telemetry...' : 'Sync Topic Coding Performance'}
              </button>
            </div>
          </form>
        </SpotlightCard>
      </div>

      {/* Charts Row: Category Averages + Coding Difficulty Stacked Bar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpotlightCard className="p-5">
          <h3 className="font-display text-lg font-bold text-white">Category Performance Averages</h3>
          <p className="mb-4 text-xs text-slate-400">Mean & peak score percentage per placement domain</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAverages} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis dataKey="category" stroke={chart.axisStroke} fontSize={10} />
                <YAxis domain={[0, 100]} stroke={chart.axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  itemStyle={chart.tooltipItemStyle}
                  labelStyle={chart.tooltipLabelStyle}
                  cursor={{ fill: chart.cursorFill }}
                />
                <Legend wrapperStyle={chart.legendStyle} />
                <Bar dataKey="averageScore" name="Avg %" fill={chart.primaryEmerald} radius={[6, 6, 0, 0]} />
                <Bar dataKey="bestScore" name="Peak %" fill={chart.primaryCyan} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5" spotlightColor="rgba(245, 158, 11, 0.2)">
          <h3 className="font-display text-lg font-bold text-white">Coding Difficulty Distribution</h3>
          <p className="mb-4 text-xs text-slate-400">
            Stacked Easy / Medium / Hard solved count across all tracked topics
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={codingActivities} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis
                  dataKey="topic"
                  stroke={chart.axisStroke}
                  fontSize={10}
                  tickFormatter={(v) => (v.length > 10 ? v.slice(0, 10) + '…' : v)}
                />
                <YAxis stroke={chart.axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  itemStyle={chart.tooltipItemStyle}
                  labelStyle={chart.tooltipLabelStyle}
                  cursor={{ fill: chart.cursorFill }}
                />
                <Legend wrapperStyle={chart.legendStyle} />
                <Bar dataKey="easySolved" name="Easy" stackId="a" fill={chart.primaryEmerald} />
                <Bar dataKey="mediumSolved" name="Medium" stackId="a" fill={chart.primaryAmber} />
                <Bar dataKey="hardSolved" name="Hard" stackId="a" fill={chart.primaryRose} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Topic Mastery Grid */}
      <SpotlightCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Coding Mastery Breakdown</h3>
            <p className="text-xs text-slate-400">Click any topic card to pre-fill the telemetry update form above</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {codingActivities.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => prefillTopic(c)}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-left transition hover:border-cyan-400/50 hover:bg-slate-900 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-white">{c.topic}</span>
                <span className="font-mono text-xs text-emerald-400">{c.masteryScore}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  style={{ width: `${c.masteryScore}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-300">E:{c.easySolved}</span>
                <span className="text-amber-300">M:{c.mediumSolved}</span>
                <span className="text-rose-300">H:{c.hardSolved}</span>
                <span className="text-slate-400">{c.accuracyRate}% acc</span>
              </div>
            </button>
          ))}
        </div>
      </SpotlightCard>

      {/* Filterable Assessment History Table */}
      <SpotlightCard className="p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Assessment Ledger</h3>
            <p className="text-xs text-slate-400">Complete chronological record of evaluated tests</p>
          </div>
          <PillNav
            layoutGroup="assessment-filter"
            activeId={filterCat}
            onSelect={setFilterCat}
            items={[
              { id: 'ALL', label: 'All' },
              { id: 'DSA_CODING', label: 'DSA' },
              { id: 'CORE_CS', label: 'Core CS' },
              { id: 'SQL_DBMS', label: 'SQL' },
              { id: 'SYSTEM_DESIGN', label: 'Sys Design' },
              { id: 'APTITUDE', label: 'Aptitude' },
              { id: 'MOCK_INTERVIEW', label: 'Mocks' },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-4">Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Difficulty</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Percentile</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssessments.map((a) => (
                <tr key={a.id} className="transition hover:bg-slate-900/50">
                  <td className="py-3 pr-4 font-medium text-white">{a.title}</td>
                  <td className="py-3 px-3 font-mono text-xs text-cyan-300">{a.category}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold ${
                        a.difficulty === 'HARD'
                          ? 'bg-rose-500/15 text-rose-300'
                          : a.difficulty === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {a.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {a.percentage}% <span className="text-slate-500 font-normal">({a.score}/{a.maxScore})</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">P{Math.round(a.percentile)}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{a.takenAt}</td>
                  <td className="py-3 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteAssessment(a.id)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-300 cursor-pointer"
                      title="Delete assessment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
