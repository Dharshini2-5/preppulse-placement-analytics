import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Database,
  Eye,
  Lock,
  MessageSquarePlus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { getChartTheme } from '../lib/chartTheme';
import { CountUp, SpotlightCard, StarBorder } from './reactbits';
import { ReadinessGauge } from './ReadinessGauge';

const RBAC_MATRIX = [
  { endpoint: '/api/dashboard/me, /api/assessments/**, /api/coding/**', student: true, mentor: true, admin: true },
  { endpoint: '/api/recommendations/generate, /api/simulator/readiness', student: true, mentor: true, admin: true },
  { endpoint: '/api/cohort/overview, /api/cohort/students/{id}/analytics', student: false, mentor: true, admin: true },
  { endpoint: '/api/cohort/feedback (Mentor Coaching Notes)', student: false, mentor: true, admin: true },
  { endpoint: '/api/admin/benchmarks, /api/admin/users/{id}/role', student: false, mentor: false, admin: true },
];

export function CohortRbacTab({ currentUser, onSwitchDemoRole, onToast }) {
  const { isDark } = useTheme();
  const chart = getChartTheme(isDark);
  const isPrivileged = currentUser?.role === 'MENTOR' || currentUser?.role === 'ADMIN';
  const isAdmin = currentUser?.role === 'ADMIN';

  const [cohort, setCohort] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const [feedbackStudentId, setFeedbackStudentId] = useState('');
  const [focusArea, setFocusArea] = useState('System Design & DSA');
  const [note, setNote] = useState('');
  const [postingFeedback, setPostingFeedback] = useState(false);

  const loadPrivilegedData = async () => {
    if (!isPrivileged) return;
    setLoading(true);
    try {
      const cohortRes = await api.getCohortOverview();
      setCohort(cohortRes);
      if (!feedbackStudentId && cohortRes.students?.length) {
        setFeedbackStudentId(String(cohortRes.students[0].id));
      }
      if (isAdmin) {
        const adminRes = await api.getAdminBenchmarks();
        setAdminData(adminRes);
      }
    } catch (err) {
      onToast?.(err.message || 'Could not load cohort analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrivilegedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const inspectStudent = async (id) => {
    try {
      const data = await api.getStudentAnalytics(id);
      setSelectedStudent(data);
    } catch (err) {
      onToast?.(err.message || 'Failed to load student analytics', 'error');
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackStudentId || !note.trim()) return;
    setPostingFeedback(true);
    try {
      await api.postMentorFeedback({
        studentId: Number(feedbackStudentId),
        focusArea,
        note,
      });
      setNote('');
      await loadPrivilegedData();
      if (selectedStudent && selectedStudent.user.id === Number(feedbackStudentId)) {
        await inspectStudent(Number(feedbackStudentId));
      }
      onToast('Mentor coaching note saved & delivered to student dashboard!');
    } catch (err) {
      onToast?.(err.message || 'Could not post feedback', 'error');
    } finally {
      setPostingFeedback(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      await loadPrivilegedData();
      onToast(`Updated user #${userId} RBAC role to ${newRole}`);
    } catch (err) {
      onToast?.(err.message || 'Role update failed', 'error');
    }
  };

  // Student view: RBAC Guard demonstration + 1-click Role Switcher
  if (!isPrivileged) {
    return (
      <div className="space-y-6">
        <SpotlightCard className="p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/15 text-amber-300">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Spring Security @PreAuthorize RBAC Enforcement
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">
                  Cohort & Admin Console Protected by Role Guard
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  You are currently authenticated with a signed JWT bearing{' '}
                  <code className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">ROLE_STUDENT</code>.
                  Cohort leaderboard and admin endpoints strictly require{' '}
                  <code className="text-cyan-300">ROLE_MENTOR</code> or <code className="text-amber-300">ROLE_ADMIN</code>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <StarBorder
                type="button"
                onClick={() => onSwitchDemoRole('mentor')}
                innerClassName="px-4 py-2.5 text-xs sm:text-sm"
              >
                <Users className="h-4 w-4 text-cyan-400" />
                <span>Switch to Mentor Demo</span>
              </StarBorder>
              <button
                type="button"
                onClick={() => onSwitchDemoRole('admin')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2.5 text-xs sm:text-sm font-semibold text-amber-200 transition hover:bg-amber-500/25 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Switch to Admin Demo</span>
              </button>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <h3 className="font-display text-lg font-bold text-white">Live API RBAC Permission Matrix</h3>
          <p className="mb-4 text-xs text-slate-400">
            Enforced server-side via SecurityFilterChain & @EnableMethodSecurity
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-[11px] uppercase text-slate-400">
                  <th className="py-2.5 pr-4">REST API Resource Scope</th>
                  <th className="py-2.5 px-3 text-center">STUDENT</th>
                  <th className="py-2.5 px-3 text-center">MENTOR</th>
                  <th className="py-2.5 px-3 text-center">ADMIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {RBAC_MATRIX.map((row) => (
                  <tr key={row.endpoint}>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-200">{row.endpoint}</td>
                    <td className="py-3 px-3 text-center">
                      {row.student ? (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] text-emerald-300">200 OK</span>
                      ) : (
                        <span className="rounded bg-rose-500/15 px-2 py-0.5 font-mono text-[11px] text-rose-300">403 DENY</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.mentor ? (
                        <span className="rounded bg-cyan-500/15 px-2 py-0.5 font-mono text-[11px] text-cyan-300">200 OK</span>
                      ) : (
                        <span className="rounded bg-rose-500/15 px-2 py-0.5 font-mono text-[11px] text-rose-300">403 DENY</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] text-amber-300">200 OK</span>
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

  if (loading || !cohort) {
    return (
      <div className="rounded-2xl glass-panel p-10 text-center text-sm font-mono text-slate-400">
        Loading cohort readiness analytics from Spring Boot...
      </div>
    );
  }

  const bandData = Object.entries(cohort.bandDistribution || {}).map(([band, count]) => ({
    band,
    count,
  }));

  const deptData = Object.entries(cohort.departmentAverages || {}).map(([department, avg]) => ({
    department,
    avg,
  }));

  return (
    <div className="space-y-6">
      {/* Cohort KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SpotlightCard className="p-5">
          <div className="text-xs text-slate-400">Total Cohort Students</div>
          <div className="mt-1 font-display text-3xl font-bold text-white">
            <CountUp to={cohort.totalStudents} />
          </div>
          <div className="mt-1 text-xs font-mono text-emerald-300">Active Batch 2026</div>
        </SpotlightCard>
        <SpotlightCard className="p-5" spotlightColor="rgba(6, 182, 212, 0.22)">
          <div className="text-xs text-slate-400">Cohort Avg Readiness</div>
          <div className="mt-1 font-display text-3xl font-bold text-cyan-400">
            <CountUp to={cohort.averageReadiness} decimals={1} suffix="/100" />
          </div>
          <div className="mt-1 text-xs font-mono text-slate-400">
            Avg {Math.round(cohort.avgLeetcodeSolved)} LC Solved
          </div>
        </SpotlightCard>
        <SpotlightCard className="p-5">
          <div className="text-xs text-slate-400">Placement Ready (≥80)</div>
          <div className="mt-1 font-display text-3xl font-bold text-emerald-400">
            <CountUp to={cohort.placementReadyCount} />
          </div>
          <div className="mt-1 text-xs font-mono text-emerald-300">Offer-Stage Candidates</div>
        </SpotlightCard>
        <SpotlightCard className="p-5" spotlightColor="rgba(245, 158, 11, 0.22)">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Needs Acceleration (&lt;68)</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-amber-400">
            <CountUp to={cohort.needsAttentionCount} />
          </div>
          <div className="mt-1 text-xs font-mono text-amber-300">Priority Mentor Follow-up</div>
        </SpotlightCard>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpotlightCard className="p-5">
          <h3 className="font-display text-lg font-bold text-white">Readiness Band Distribution</h3>
          <p className="mb-4 text-xs text-slate-400">Number of students across readiness tiers</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis dataKey="band" stroke={chart.axisStroke} fontSize={11} />
                <YAxis allowDecimals={false} stroke={chart.axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  itemStyle={chart.tooltipItemStyle}
                  labelStyle={chart.tooltipLabelStyle}
                  cursor={{ fill: chart.cursorFill }}
                />
                <Bar dataKey="count" name="Students" fill={chart.primaryEmerald} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5" spotlightColor="rgba(6, 182, 212, 0.2)">
          <h3 className="font-display text-lg font-bold text-white">Department Readiness Benchmark</h3>
          <p className="mb-4 text-xs text-slate-400">Average dynamic readiness index per department</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis dataKey="department" stroke={chart.axisStroke} fontSize={11} />
                <YAxis domain={[0, 100]} stroke={chart.axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  itemStyle={chart.tooltipItemStyle}
                  labelStyle={chart.tooltipLabelStyle}
                  cursor={{ fill: chart.cursorFill }}
                />
                <Bar dataKey="avg" name="Avg Readiness" fill={chart.primaryCyan} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Cohort Leaderboard Table */}
      <SpotlightCard className="p-5">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold text-white">Cohort Readiness Leaderboard</h3>
          <p className="text-xs text-slate-400">
            Ranked dynamically by Spring Boot ReadinessScoringService • Click Inspect for full student drill-down
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-[11px] uppercase text-slate-400">
                <th className="py-2.5 pr-4">Student</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">LC Solved</th>
                <th className="py-2.5 px-3">Readiness</th>
                <th className="py-2.5 px-3">Band</th>
                <th className="py-2.5 pl-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cohort.students.map((st) => (
                <tr key={st.id} className="transition hover:bg-slate-900/50">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-white">{st.fullName}</div>
                    <div className="text-[11px] font-mono text-slate-400">CGPA {st.cgpa}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{st.department}</td>
                  <td className="py-3 px-3 font-mono text-cyan-300">{st.targetTier}</td>
                  <td className="py-3 px-3 font-mono text-slate-200">{st.leetcodeSolved}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">{st.readinessIndex}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                      {st.readinessBand}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => inspectStudent(st.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Analytics</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Inspected Student Drill-down */}
      {selectedStudent && (
        <SpotlightCard className="p-6 border-cyan-400/35">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400">Student Analytics Drill-Down</span>
              <h3 className="font-display text-xl font-bold text-white">
                {selectedStudent.user.fullName} ({selectedStudent.user.department})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Close ×
            </button>
          </div>
          <div className="grid items-center gap-6 md:grid-cols-12">
            <div className="md:col-span-4 flex justify-center">
              <ReadinessGauge
                score={selectedStudent.readiness.readinessIndex}
                band={selectedStudent.readiness.readinessBand}
                targetTier={selectedStudent.readiness.targetTier}
                size={180}
              />
            </div>
            <div className="md:col-span-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
                <div className="text-slate-400">Assessment Average</div>
                <div className="mt-1 font-mono text-xl font-bold text-white">
                  {selectedStudent.readiness.assessmentAverage}%
                </div>
                <div className="mt-1 text-slate-400">
                  Trend Slope: {selectedStudent.readiness.trendSlope >= 0 ? '+' : ''}
                  {selectedStudent.readiness.trendSlope}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
                <div className="text-slate-400">Coding Volume & Accuracy</div>
                <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
                  {selectedStudent.readiness.totalProblemsSolved} Solved
                </div>
                <div className="mt-1 text-slate-400">
                  Accuracy: {selectedStudent.readiness.codingAccuracyAvg}%
                </div>
              </div>
              <div className="sm:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
                <div className="mb-1.5 font-mono text-[11px] uppercase text-amber-300">
                  Active Top Recommendations ({selectedStudent.recommendations.length})
                </div>
                <ul className="space-y-1 text-slate-300">
                  {selectedStudent.recommendations.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      • <strong className="text-white">[{r.priority}]</strong> {r.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Mentor Feedback Composer */}
      <SpotlightCard className="p-6" spotlightColor="rgba(245, 158, 11, 0.2)">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="font-display text-lg font-bold text-white">Post Mentor Coaching Feedback</h3>
            <p className="text-xs text-slate-400">Appears immediately inside the selected student's dashboard</p>
          </div>
        </div>
        <form onSubmit={submitFeedback} className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="mb-1 block text-xs text-slate-300">Student</label>
            <select
              value={feedbackStudentId}
              onChange={(e) => setFeedbackStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
            >
              {cohort.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.readinessIndex})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="mb-1 block text-xs text-slate-300">Focus Area</label>
            <input
              type="text"
              required
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
            />
          </div>
          <div className="md:col-span-4 flex items-end">
            <StarBorder
              type="submit"
              disabled={postingFeedback}
              className="w-full"
              innerClassName="w-full py-2 text-sm"
            >
              {postingFeedback ? 'Posting...' : 'Deliver Mentor Feedback'}
            </StarBorder>
          </div>
          <div className="md:col-span-12">
            <textarea
              rows={2}
              required
              minLength={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write actionable interview, coding, or domain coaching feedback..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
            />
          </div>
        </form>
      </SpotlightCard>

      {/* Admin-Only RBAC & Platform Benchmarks Console */}
      {isAdmin && adminData && (
        <SpotlightCard className="p-6 border-amber-400/35" spotlightColor="rgba(245, 158, 11, 0.25)">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Admin RBAC Directory & Platform Benchmarks
                </h3>
                <p className="text-xs text-slate-400">
                  Exclusive to <code className="text-amber-300">ROLE_ADMIN</code> • Manage account privileges & inspect DB mode
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-emerald-300">
              <Database className="h-3.5 w-3.5" />
              <span>{adminData.databaseMode}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-[11px] uppercase text-slate-400">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 pl-3 text-right">Assigned RBAC Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {adminData.users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-4 font-medium text-white">{u.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{u.email}</td>
                    <td className="py-2.5 px-3 text-slate-300">{u.department}</td>
                    <td className="py-2.5 pl-3 text-right">
                      <select
                        value={u.role}
                        disabled={u.id === currentUser.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs text-amber-300 outline-none disabled:opacity-50"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="MENTOR">MENTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
