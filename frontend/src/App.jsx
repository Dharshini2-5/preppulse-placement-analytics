import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Crown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelBottom,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  api,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  setAuthSession,
} from './lib/api';
import { useTheme } from './context/ThemeContext';
import { exportDashboardCsv, exportDashboardJson } from './lib/exportReport';
import { Aurora, ClickSpark, Dock, Squares } from './components/reactbits';
import { BootSplash } from './components/BootSplash';
import { LandingSplash } from './components/LandingSplash';
import { AuthModal } from './components/AuthModal';
import { OverviewTab } from './components/OverviewTab';
import { AssessmentsCodingTab } from './components/AssessmentsCodingTab';
import { SimulatorTab } from './components/SimulatorTab';
import { RecommendationsTab } from './components/RecommendationsTab';
import { CohortRbacTab } from './components/CohortRbacTab';
import { SaaSSettingsTab } from './components/SaaSSettingsTab';
import { CommandPalette } from './components/CommandPalette';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { ThemeToggle } from './components/ThemeToggle';

const DEMO_CREDS = {
  student: ['dharshini@placement.edu', 'Student@123'],
  mentor: ['mentor@placement.edu', 'Mentor@123'],
  admin: ['admin@placement.edu', 'Admin@123'],
};

const WORKSPACES = [
  {
    id: 'ws-ece-2027',
    name: 'Anna Univ — ECE 2027',
    tag: 'ECE Cohort',
    org: 'Anna University Placement Cell',
    batch: 'Batch 2027 • ECE / Core + SDE',
  },
  {
    id: 'ws-campus-cell',
    name: 'Campus Placement Cell',
    tag: 'Multi-Dept',
    org: 'CEG Campus Career Center',
    batch: 'Batch 2026 • All Engineering Depts',
  },
  {
    id: 'ws-faang-sprint',
    name: 'FAANG Sprint Cohort',
    tag: 'Dream ≥88',
    org: 'Product & FAANG Interview Guild',
    batch: '2026-27 • High-Velocity DSA Track',
  },
];

const WORKSPACE_STORAGE = 'preppulse_workspace_id';
const PLAN_STORAGE = 'preppulse_active_plan';
const DOCK_STORAGE = 'preppulse_show_dock';
const SIDEBAR_STORAGE = 'preppulse_sidebar_collapsed';
const ORG_CFG_STORAGE = 'preppulse_org_config';

export default function App() {
  const { isDark } = useTheme();
  const [booting, setBooting] = useState(true);
  const [view, setView] = useState('splash'); // 'splash' | 'workspace'
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsSubTab, setSettingsSubTab] = useState('appearance');

  // Modals & Drawers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Persisted SaaS Shell Preferences
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE) === 'true';
    } catch {
      return false;
    }
  });
  const [showDock, setShowDock] = useState(() => {
    try {
      const saved = localStorage.getItem(DOCK_STORAGE);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    try {
      return localStorage.getItem(WORKSPACE_STORAGE) || WORKSPACES[0].id;
    } catch {
      return WORKSPACES[0].id;
    }
  });
  const [activePlan, setActivePlan] = useState(() => {
    try {
      return localStorage.getItem(PLAN_STORAGE) || 'Placement Pro';
    } catch {
      return 'Placement Pro';
    }
  });
  const [workspaceConfig, setWorkspaceConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(ORG_CFG_STORAGE);
      return saved
        ? JSON.parse(saved)
        : { orgName: 'Anna University Placement Cell', targetBatch: 'Batch 2027 • ECE / CSE' };
    } catch {
      return { orgName: 'Anna University Placement Cell', targetBatch: 'Batch 2027 • ECE / CSE' };
    }
  });

  // Backend Data & Health State
  const [telemetry, setTelemetry] = useState(null);
  const [apiHealth, setApiHealth] = useState({ online: false, latencyMs: null });
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Toast, Notifications & Audit Trail
  const [toast, setToast] = useState(null);
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [sessionNotifications, setSessionNotifications] = useState([]);
  const [auditLog, setAuditLog] = useState([
    {
      id: 'init-1',
      category: 'SYSTEM',
      message: 'PrepPulse SaaS shell initialized with Spring Boot REST telemetry (:8081)',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const profileMenuRef = useRef(null);
  const workspaceMenuRef = useRef(null);

  const activeWorkspace = useMemo(
    () => WORKSPACES.find((w) => w.id === activeWorkspaceId) || WORKSPACES[0],
    [activeWorkspaceId]
  );

  const addAuditEvent = useCallback((category, message) => {
    setAuditLog((prev) => [
      {
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const pushSessionNotif = useCallback((title, message, category = 'ACTIVITY', tone = 'emerald', targetTab = 'overview') => {
    setSessionNotifications((prev) => [
      {
        id: `sn-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        title,
        message,
        category,
        tone,
        time: 'Just now',
        targetTab,
        icon: Sparkles,
      },
      ...prev.slice(0, 14),
    ]);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  // Global Ctrl+K / Cmd+K Command Palette Shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(e.target)) {
        setWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pingApiHealth = useCallback(async () => {
    const started = performance.now();
    try {
      await api.health();
      const latencyMs = Math.max(1, Math.round(performance.now() - started));
      setApiHealth({ online: true, latencyMs });
    } catch {
      setApiHealth({ online: false, latencyMs: null });
    }
  }, []);

  const loadTelemetry = useCallback(async () => {
    try {
      const stats = await api.publicStats();
      setTelemetry(stats);
    } catch {
      // Backend may still be booting
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!getStoredToken()) return;
    setLoadingDashboard(true);
    try {
      const data = await api.getDashboard();
      setDashboard(data);
      setCurrentUser(data.user);
      setAuthSession(getStoredToken(), data.user);
    } catch (err) {
      if (err.status === 401) {
        clearAuthSession();
        setCurrentUser(null);
        setDashboard(null);
        setView('splash');
      }
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    loadTelemetry();
    pingApiHealth();
    if (getStoredToken()) {
      loadDashboard();
    }
    const interval = setInterval(pingApiHealth, 30000);
    return () => clearInterval(interval);
  }, [loadTelemetry, loadDashboard, pingApiHealth]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleDock = () => {
    setShowDock((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(DOCK_STORAGE, String(next));
      } catch {
        // ignore
      }
      showToast(next ? 'Floating ReactBits Dock shown' : 'Floating ReactBits Dock hidden');
      return next;
    });
  };

  const handleSelectWorkspace = (ws) => {
    setActiveWorkspaceId(ws.id);
    setWorkspaceMenuOpen(false);
    try {
      localStorage.setItem(WORKSPACE_STORAGE, ws.id);
    } catch {
      // ignore
    }
    addAuditEvent('WORKSPACE', `Switched active tenant workspace to "${ws.name}"`);
    showToast(`Switched workspace to ${ws.name}`);
  };

  const handleChangePlan = (planName) => {
    setActivePlan(planName);
    try {
      localStorage.setItem(PLAN_STORAGE, planName);
    } catch {
      // ignore
    }
    pushSessionNotif('Subscription Plan Updated', `Workspace is now provisioned on ${planName}.`, 'BILLING', 'emerald', 'settings');
  };

  const handleUpdateWorkspaceConfig = (nextCfg) => {
    setWorkspaceConfig(nextCfg);
    try {
      localStorage.setItem(ORG_CFG_STORAGE, JSON.stringify(nextCfg));
    } catch {
      // ignore
    }
  };

  const handleAuthSuccess = async (authResponse, planChosen = null) => {
    setAuthSession(authResponse.token, authResponse.user);
    setCurrentUser(authResponse.user);
    setAuthModalOpen(false);
    setSelectedPlanForAuth(null);
    if (planChosen?.name) {
      handleChangePlan(planChosen.name);
    }
    setView('workspace');
    setActiveTab(authResponse.user.role === 'STUDENT' ? 'overview' : 'cohort');
    await Promise.all([loadDashboard(), loadTelemetry(), pingApiHealth()]);
    addAuditEvent('AUTH', `Authenticated as ${authResponse.user.fullName} (${authResponse.user.role}) via JWT HS256`);
    showToast(`Signed in as ${authResponse.user.fullName} (${authResponse.user.role})`);
  };

  const handleQuickDemo = async (roleKey) => {
    const creds = DEMO_CREDS[roleKey] || DEMO_CREDS.student;
    try {
      const res = await api.login(creds[0], creds[1]);
      await handleAuthSuccess(res);
    } catch (err) {
      showToast(err.message || 'Backend API unavailable on port 8081', 'error');
      setAuthModalOpen(true);
    }
  };

  const handleLaunchWorkspace = () => {
    if (currentUser && getStoredToken()) {
      setView('workspace');
      loadDashboard();
    } else {
      setSelectedPlanForAuth(null);
      setAuthModalOpen(true);
    }
  };

  const handleSelectPlanFromSplash = (planPayload) => {
    if (currentUser && getStoredToken()) {
      handleChangePlan(planPayload.name);
      setView('workspace');
      setActiveTab('settings');
      setSettingsSubTab('billing');
      showToast(`Selected ${planPayload.name} (${planPayload.priceLabel})`);
    } else {
      setSelectedPlanForAuth(planPayload);
      setAuthModalOpen(true);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setDashboard(null);
    setProfileMenuOpen(false);
    setView('splash');
    addAuditEvent('AUTH', 'Signed out cleanly & cleared local JWT session');
    showToast('Signed out cleanly. JWT cleared.');
  };

  const handleUpdateTargetTier = async (tier) => {
    try {
      await api.updateTargetTier(tier);
      await loadDashboard();
      addAuditEvent('ANALYTICS', `Updated target placement benchmark tier to ${tier}`);
      showToast(`Target placement tier updated to ${tier}`);
    } catch (err) {
      showToast(err.message || 'Could not update target tier', 'error');
    }
  };

  const handleRegenerateRecsFromCommand = async () => {
    if (!getStoredToken()) {
      showToast('Sign in to regenerate personalized AI recommendations', 'error');
      return;
    }
    try {
      await api.generateRecommendations();
      await loadDashboard();
      setView('workspace');
      setActiveTab('recommendations');
      addAuditEvent('AI_ENGINE', 'Regenerated preparation recommendations via Ctrl+K command');
      pushSessionNotif(
        'AI Workflows Refreshed',
        'Generated updated placement action plans from your latest telemetry.',
        'AI ENGINE',
        'emerald',
        'recommendations'
      );
      showToast('AI Preparation Workflows regenerated from live telemetry!');
    } catch (err) {
      showToast(err.message || 'Could not regenerate recommendations', 'error');
    }
  };

  const handleExportCsv = () => {
    if (!dashboard) {
      showToast('Sign in and load workspace analytics before exporting CSV', 'error');
      return;
    }
    const filename = exportDashboardCsv({
      dashboard,
      workspaceName: `${activeWorkspace.name} (${workspaceConfig.orgName})`,
      planName: activePlan,
    });
    addAuditEvent('EXPORT', `Downloaded CSV analytics report (${filename})`);
    pushSessionNotif('CSV Report Exported', `Saved ${filename} to your device.`, 'EXPORT', 'cyan', 'settings');
    showToast(`Exported ${filename}`);
  };

  const handleExportJson = () => {
    if (!dashboard) {
      showToast('Sign in and load workspace analytics before exporting JSON', 'error');
      return;
    }
    const filename = exportDashboardJson({
      dashboard,
      workspaceName: `${activeWorkspace.name} (${workspaceConfig.orgName})`,
      planName: activePlan,
    });
    addAuditEvent('EXPORT', `Downloaded JSON telemetry snapshot (${filename})`);
    pushSessionNotif('JSON Payload Exported', `Saved ${filename} to your device.`, 'EXPORT', 'cyan', 'settings');
    showToast(`Exported ${filename}`);
  };

  const pendingRecs = dashboard?.recommendations?.filter((r) => !r.completed).length || 0;

  // Estimate live unread badge count for notification bell
  const unreadNotifCount = useMemo(() => {
    const readSet = new Set(readNotifIds);
    const ids = ['ctx-api-health'];
    if (dashboard?.readiness) {
      ids.push(
        dashboard.readiness.gapToTarget > 0
          ? `ctx-gap-${dashboard.readiness.targetTier}`
          : `ctx-achieved-${dashboard.readiness.targetTier}`
      );
      if (dashboard.readiness.maxWeeklyStreak >= 4) {
        ids.push(`ctx-streak-${dashboard.readiness.maxWeeklyStreak}`);
      }
    }
    const highRecs = (dashboard?.recommendations || []).filter(
      (r) => !r.completed && (r.priority === 'CRITICAL' || r.priority === 'HIGH')
    );
    if (highRecs.length > 0) ids.push(`ctx-recs-${highRecs.length}`);
    if (dashboard?.mentorFeedback?.length > 0) {
      ids.push(`ctx-feedback-${dashboard.mentorFeedback[0].id || 'latest'}`);
    }
    sessionNotifications.forEach((n) => ids.push(n.id));
    return ids.filter((id) => !readSet.has(id)).length;
  }, [dashboard, readNotifIds, sessionNotifications]);

  const analyticsNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assessments', label: 'Assessments & Coding', icon: Code2 },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
    {
      id: 'recommendations',
      label: 'AI Recommendations',
      icon: Sparkles,
      badge: pendingRecs > 0 ? pendingRecs : null,
    },
  ];

  const adminNav = [
    { id: 'cohort', label: 'Cohort & RBAC', icon: Users },
    { id: 'settings', label: 'Workspace & Billing', icon: Settings },
  ];

  const dockItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'assessments', label: 'Assessments & Coding', icon: Code2 },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
    {
      id: 'recommendations',
      label: 'AI Prep Workflows',
      icon: Sparkles,
      badge: pendingRecs > 0 ? pendingRecs : null,
    },
    { id: 'cohort', label: 'Cohort & RBAC', icon: Users },
    { id: 'settings', label: 'Workspace & Billing', icon: Settings },
  ];

  const roleBadgeClass =
    currentUser?.role === 'ADMIN'
      ? 'border-amber-500/45 bg-amber-500/15 text-amber-700 dark:text-amber-300'
      : currentUser?.role === 'MENTOR'
      ? 'border-cyan-500/45 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
      : 'border-emerald-500/45 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';

  const assessmentsUsed = dashboard?.assessments?.length ?? telemetry?.assessmentsAnalyzed ?? 0;
  const quotaPct = Math.min(100, Math.max(8, Math.round((assessmentsUsed / 100) * 100)));

  const renderSidebarContent = (isMobile = false) => {
    const compact = !isMobile && sidebarCollapsed;

    return (
      <div className="flex h-full flex-col justify-between p-3">
        <div>
          {/* Brand Row */}
          <div className={`flex items-center ${compact ? 'justify-center' : 'justify-between'} px-1.5 py-2`}>
            <button
              type="button"
              onClick={() => {
                setView('splash');
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
              title="PrepPulse Analytics — View Splash Page"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 shadow-[0_0_18px_rgba(16,185,129,0.2)]">
                <Activity className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              {!compact && (
                <div className="min-w-0">
                  <div className="font-display text-base font-bold leading-tight text-slate-900 dark:text-white truncate">
                    PrepPulse <span className="text-emerald-600 dark:text-emerald-400">SaaS</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    READINESS PLATFORM
                  </div>
                </div>
              )}
            </button>

            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Multi-Workspace Tenant Switcher */}
          <div className="relative mt-3" ref={!isMobile ? workspaceMenuRef : undefined}>
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen((prev) => !prev)}
              className={`flex w-full items-center ${
                compact ? 'justify-center p-2' : 'justify-between px-3 py-2.5'
              } rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900/75 hover:border-emerald-400/45'
                  : 'border-slate-200 bg-slate-50/90 hover:border-emerald-500/45'
              }`}
              title={`Workspace: ${activeWorkspace.name}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                {!compact && (
                  <div className="min-w-0 text-left">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {activeWorkspace.name}
                    </div>
                    <div className="truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {activeWorkspace.tag}
                    </div>
                  </div>
                )}
              </div>
              {!compact && (
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                    workspaceMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            <AnimatePresence>
              {workspaceMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  className={`absolute left-0 z-50 mt-2 ${
                    compact ? 'w-60' : 'w-full'
                  } rounded-xl glass-panel-strong p-1.5 shadow-2xl`}
                >
                  <div className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    Switch Cohort Workspace
                  </div>
                  {WORKSPACES.map((ws) => {
                    const selected = ws.id === activeWorkspace.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSelectWorkspace(ws)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                          selected
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate">{ws.name}</div>
                          <div className="truncate font-mono text-[10px] text-slate-400">{ws.tag}</div>
                        </div>
                        {selected && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analytics Navigation Group */}
          <div className="mt-5">
            {!compact && (
              <div className="mb-1.5 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Analytics
              </div>
            )}
            <nav className="space-y-1">
              {analyticsNav.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    title={compact ? item.label : undefined}
                    className={`group relative flex w-full items-center ${
                      compact ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
                    } rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      active
                        ? isDark
                          ? 'bg-emerald-500/18 text-emerald-300 border border-emerald-400/35 shadow-[0_0_18px_rgba(16,185,129,0.14)]'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-500/30 shadow-2xs font-semibold'
                        : isDark
                        ? 'text-slate-300 border border-transparent hover:bg-slate-900/70 hover:text-white'
                        : 'text-slate-600 border border-transparent hover:bg-slate-100/90 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-500 dark:text-emerald-400' : ''}`} />
                      {!compact && <span className="truncate">{item.label}</span>}
                    </span>
                    {!compact && item.badge && (
                      <span
                        data-keep-light-text="true"
                        className="rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
                      >
                        {item.badge}
                      </span>
                    )}
                    {compact && item.badge && (
                      <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Administration Navigation Group */}
          <div className="mt-5">
            {!compact && (
              <div className="mb-1.5 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Administration
              </div>
            )}
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    title={compact ? item.label : undefined}
                    className={`flex w-full items-center ${
                      compact ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2.5'
                    } rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      active
                        ? isDark
                          ? 'bg-emerald-500/18 text-emerald-300 border border-emerald-400/35 shadow-[0_0_18px_rgba(16,185,129,0.14)]'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-500/30 shadow-2xs font-semibold'
                        : isDark
                        ? 'text-slate-300 border border-transparent hover:bg-slate-900/70 hover:text-white'
                        : 'text-slate-600 border border-transparent hover:bg-slate-100/90 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-500 dark:text-emerald-400' : ''}`} />
                    {!compact && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Live Plan Badge + Metered Quota Mini-Bar */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setSettingsSubTab('billing');
              setMobileSidebarOpen(false);
            }}
            className={`w-full rounded-xl border text-left transition cursor-pointer ${
              compact ? 'p-2 flex justify-center' : 'p-3'
            } ${
              isDark
                ? 'border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 hover:border-emerald-400/50'
                : 'border-emerald-500/25 bg-emerald-50/70 hover:bg-emerald-50'
            }`}
            title={`${activePlan} — Click to view quotas & billing`}
          >
            {compact ? (
              <Crown className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Crown className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>{activePlan}</span>
                  </span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                    LIVE
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Telemetry Quota</span>
                  <span>{assessmentsUsed} / 100+</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${quotaPct}%` }}
                  />
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <ClickSpark sparkColor={isDark ? '#10B981' : '#059669'} secondaryColor={isDark ? '#06B6D4' : '#0891B2'}>
      <div
        className={`relative min-h-screen transition-colors duration-300 ${
          isDark ? 'bg-[#050914] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
        }`}
      >
        <Aurora opacity={0.26} />
        <Squares squareSize={48} />

        {/* 1.5s Boot Preloader */}
        <AnimatePresence>
          {booting && <BootSplash onDone={() => setBooting(false)} />}
        </AnimatePresence>

        {/* Main View Switcher: SaaS Splash Landing vs Multi-Workspace App Shell */}
        {view === 'splash' ? (
          <LandingSplash
            telemetry={telemetry}
            currentUser={currentUser}
            onLaunchWorkspace={handleLaunchWorkspace}
            onQuickDemo={handleQuickDemo}
            onOpenAuth={() => {
              setSelectedPlanForAuth(null);
              setAuthModalOpen(true);
            }}
            onSelectPlan={handleSelectPlanFromSplash}
          />
        ) : (
          <div className="relative z-10 flex min-h-screen">
            {/* Desktop Collapsible SaaS Left Sidebar */}
            <aside
              className={`hidden lg:flex shrink-0 flex-col border-r sticky top-0 h-screen transition-all duration-300 ${
                sidebarCollapsed ? 'w-[76px]' : 'w-64'
              } ${
                isDark
                  ? 'border-slate-800/80 bg-[#050914]/86 backdrop-blur-2xl'
                  : 'border-slate-200/90 bg-white/86 backdrop-blur-2xl shadow-[4px_0_24px_-16px_rgba(15,23,42,0.08)]'
              }`}
            >
              {renderSidebarContent(false)}
            </aside>

            {/* Mobile Slide-over Sidebar Drawer */}
            <AnimatePresence>
              {mobileSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`fixed inset-0 z-[130] lg:hidden backdrop-blur-sm ${
                    isDark ? 'bg-slate-950/75' : 'bg-slate-900/30'
                  }`}
                >
                  <motion.aside
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`h-full w-72 border-r ${
                      isDark ? 'border-slate-800 bg-[#070D1D]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {renderSidebarContent(true)}
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Column */}
            <div className={`flex min-w-0 flex-1 flex-col ${showDock ? 'pb-28' : 'pb-12'}`}>
              {/* Enterprise Top Command Header */}
              <header
                className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
                  isDark
                    ? 'border-slate-800/80 bg-[#050914]/82'
                    : 'border-slate-200/90 bg-white/85 shadow-[0_4px_20px_-14px_rgba(15,23,42,0.08)]'
                }`}
              >
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 px-4 py-3 sm:px-6">
                  {/* Left: Sidebar Toggle + Workspace Context */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(true)}
                      className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-600 dark:text-slate-300 cursor-pointer"
                      aria-label="Open menu"
                    >
                      <Menu className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleSidebar}
                      className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-500 dark:text-slate-300 transition hover:border-emerald-400/50 cursor-pointer"
                      title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                      {sidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </button>

                    {/* Active Workspace Contextual Pill */}
                    <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[160px]">
                        {activeWorkspace.name}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="font-mono text-[11px] uppercase text-emerald-600 dark:text-emerald-400">
                        {activeTab}
                      </span>
                    </div>

                    {/* Global Ctrl+K Command Search Trigger */}
                    <button
                      type="button"
                      onClick={() => setCmdOpen(true)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-xs transition cursor-pointer ${
                        isDark
                          ? 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-emerald-400/45 hover:text-slate-200'
                          : 'border-slate-200 bg-slate-100/85 text-slate-500 hover:border-emerald-500/45 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span className="hidden sm:inline">Quick Command...</span>
                      <kbd
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                          isDark
                            ? 'border-slate-700 bg-slate-950 text-slate-400'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        Ctrl K
                      </kbd>
                    </button>
                  </div>

                  {/* Right: Live API Latency Pill + Theme Toggle + Bell + Dock Toggle + Profile Menu */}
                  <div className="flex items-center gap-2">
                    {/* Live API Latency & Health Pill */}
                    <button
                      type="button"
                      onClick={() => {
                        pingApiHealth();
                        showToast('Re-pinged Spring Boot /api/health');
                      }}
                      title="Live Spring Boot API (:8081) Health — Click to re-ping"
                      className="hidden xl:inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/75 px-3 py-1.5 font-mono text-[11px] transition hover:border-emerald-400/50 cursor-pointer"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          apiHealth.online
                            ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
                            : 'bg-amber-400 animate-pulse'
                        }`}
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {apiHealth.online ? `LIVE • ${apiHealth.latencyMs}ms` : 'API OFFLINE'}
                      </span>
                    </button>

                    {/* Dark / Light Mode Toggle */}
                    <ThemeToggle
                      onToggleAfter={(next) =>
                        addAuditEvent('THEME', `Toggled workspace theme to ${next.toUpperCase()}`)
                      }
                    />

                    {/* Dock Quick Toggle */}
                    <button
                      type="button"
                      onClick={handleToggleDock}
                      className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
                        showDock
                          ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={showDock ? 'Hide Floating ReactBits Dock' : 'Show Floating ReactBits Dock'}
                    >
                      <PanelBottom className="h-4 w-4" />
                    </button>

                    {/* Notifications Bell Drawer Trigger */}
                    <button
                      type="button"
                      onClick={() => setNotifOpen(true)}
                      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-600 dark:text-slate-300 transition hover:border-emerald-400/50 cursor-pointer"
                      aria-label="Open notifications"
                      title="Activity & Readiness Alerts"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadNotifCount > 0 && (
                        <span
                          data-keep-light-text="true"
                          className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 font-mono text-[10px] font-bold text-white shadow"
                        >
                          {unreadNotifCount}
                        </span>
                      )}
                    </button>

                    {/* Profile & Role Switcher Menu */}
                    <div className="relative" ref={profileMenuRef}>
                      <button
                        type="button"
                        onClick={() => setProfileMenuOpen((prev) => !prev)}
                        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/75 px-2.5 py-1.5 transition hover:border-emerald-400/50 cursor-pointer"
                      >
                        <div
                          data-keep-light-text="true"
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-display text-xs font-bold text-white"
                        >
                          {currentUser?.fullName?.charAt(0) || 'P'}
                        </div>
                        <span className="hidden md:inline max-w-[110px] truncate text-xs font-semibold text-slate-900 dark:text-white">
                          {currentUser?.fullName || 'Guest'}
                        </span>
                        {currentUser?.role && (
                          <span className={`hidden sm:inline rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold ${roleBadgeClass}`}>
                            {currentUser.role}
                          </span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {profileMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                            className="absolute right-0 z-50 mt-2 w-64 rounded-2xl glass-panel-strong p-2 shadow-2xl"
                          >
                            {currentUser && (
                              <div className="border-b border-slate-800/70 px-3 py-2.5">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {currentUser.fullName}
                                </div>
                                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {currentUser.email}
                                </div>
                              </div>
                            )}

                            <div className="py-1.5">
                              <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                                Instant RBAC Role Switch
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileMenuOpen(false);
                                  handleQuickDemo('student');
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-500/12 cursor-pointer"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>STUDENT • Dharshini A</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileMenuOpen(false);
                                  handleQuickDemo('mentor');
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-cyan-500/12 cursor-pointer"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
                                <span>MENTOR • Dr. Karthik</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileMenuOpen(false);
                                  handleQuickDemo('admin');
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-500/12 cursor-pointer"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                                <span>ADMIN • Placement Cell</span>
                              </button>
                            </div>

                            <div className="border-t border-slate-800/70 pt-1.5 space-y-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileMenuOpen(false);
                                  setAuthModalOpen(true);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-800/40 cursor-pointer"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Open JWT Auth Gate</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileMenuOpen(false);
                                  setActiveTab('settings');
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-800/40 cursor-pointer"
                              >
                                <Settings className="h-3.5 w-3.5 text-cyan-500" />
                                <span>Workspace &amp; Billing</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileMenuOpen(false);
                                  setView('splash');
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-800/40 cursor-pointer"
                              >
                                <Home className="h-3.5 w-3.5 text-slate-400" />
                                <span>Splash Page</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/12 cursor-pointer"
                              >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Sign Out</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </header>

              {/* Active Workspace View */}
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 sm:px-6">
                {loadingDashboard && !dashboard && activeTab !== 'settings' ? (
                  <div className="flex h-72 flex-col items-center justify-center rounded-2xl glass-panel">
                    <BarChart3 className="h-8 w-8 animate-pulse text-emerald-500 dark:text-emerald-400" />
                    <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      Computing Dynamic Readiness Index &amp; Skill Progression...
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      {activeTab === 'overview' && (
                        <OverviewTab
                          dashboard={dashboard}
                          onUpdateTargetTier={handleUpdateTargetTier}
                          onNavigate={setActiveTab}
                        />
                      )}
                      {activeTab === 'assessments' && (
                        <AssessmentsCodingTab
                          dashboard={dashboard}
                          onRefresh={loadDashboard}
                          onToast={(msg, type) => {
                            showToast(msg, type);
                            if (type !== 'error') addAuditEvent('TELEMETRY', msg);
                          }}
                        />
                      )}
                      {activeTab === 'simulator' && (
                        <SimulatorTab dashboard={dashboard} onToast={showToast} />
                      )}
                      {activeTab === 'recommendations' && (
                        <RecommendationsTab
                          dashboard={dashboard}
                          onRefresh={loadDashboard}
                          onToast={(msg, type) => {
                            showToast(msg, type);
                            if (type !== 'error') addAuditEvent('WORKFLOW', msg);
                          }}
                        />
                      )}
                      {activeTab === 'cohort' && (
                        <CohortRbacTab
                          currentUser={currentUser}
                          onSwitchDemoRole={handleQuickDemo}
                          onToast={(msg, type) => {
                            showToast(msg, type);
                            if (type !== 'error') addAuditEvent('RBAC', msg);
                          }}
                        />
                      )}
                      {activeTab === 'settings' && (
                        <SaaSSettingsTab
                          initialSubTab={settingsSubTab}
                          dashboard={dashboard}
                          telemetry={telemetry}
                          workspaceConfig={workspaceConfig}
                          onUpdateWorkspaceConfig={handleUpdateWorkspaceConfig}
                          showDock={showDock}
                          onToggleDock={handleToggleDock}
                          activePlan={activePlan}
                          onChangePlan={handleChangePlan}
                          onExportCsv={handleExportCsv}
                          onExportJson={handleExportJson}
                          auditLog={auditLog}
                          onClearAuditLog={() => {
                            setAuditLog([]);
                            showToast('Session audit trail cleared');
                          }}
                          onAddAuditEvent={addAuditEvent}
                          onToast={showToast}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </main>

              {/* Toggleable ReactBits macOS Floating Magnification Dock */}
              {showDock && <Dock items={dockItems} activeId={activeTab} onSelect={setActiveTab} />}
            </div>
          </div>
        )}

        {/* Global Ctrl+K Command Palette */}
        <CommandPalette
          open={cmdOpen}
          onClose={() => setCmdOpen(false)}
          activeTab={activeTab}
          onNavigate={(tab) => {
            if (!currentUser && tab !== 'settings') {
              setAuthModalOpen(true);
              return;
            }
            setView('workspace');
            setActiveTab(tab);
          }}
          onNavigateSettingsSub={(sub) => {
            setView('workspace');
            setActiveTab('settings');
            setSettingsSubTab(sub);
          }}
          onGoSplash={() => setView('splash')}
          onQuickDemo={handleQuickDemo}
          onLogout={handleLogout}
          onRegenerateRecommendations={handleRegenerateRecsFromCommand}
          onExportCsv={handleExportCsv}
          onExportJson={handleExportJson}
          showDock={showDock}
          onToggleDock={handleToggleDock}
          currentUser={currentUser}
        />

        {/* Slide-over Notifications & Activity Drawer */}
        <NotificationsDrawer
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          dashboard={dashboard}
          currentUser={currentUser}
          sessionNotifications={sessionNotifications}
          readIds={readNotifIds}
          onMarkRead={(id) =>
            setReadNotifIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
          }
          onMarkAllRead={(allIds) =>
            setReadNotifIds((prev) => Array.from(new Set([...prev, ...allIds])))
          }
          onNavigate={(tab) => {
            setView('workspace');
            setActiveTab(tab);
          }}
          apiHealth={apiHealth}
        />

        {/* Auth Modal (with optional Selected Pricing Tier badge) */}
        <AuthModal
          open={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            setSelectedPlanForAuth(null);
          }}
          onAuthSuccess={handleAuthSuccess}
          selectedPlan={selectedPlanForAuth}
        />

        {/* Global Toast Notification Banner */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              data-keep-light-text={isDark ? 'true' : undefined}
              className={`fixed top-5 right-5 z-[180] flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-xl ${
                toast.type === 'error'
                  ? isDark
                    ? 'border-rose-500/45 bg-rose-950/92 text-rose-100'
                    : 'border-rose-300 bg-rose-50/95 text-rose-800'
                  : isDark
                  ? 'border-emerald-400/45 bg-[#07191A]/94 text-emerald-100'
                  : 'border-emerald-300 bg-white/96 text-slate-900'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ClickSpark>
  );
}
