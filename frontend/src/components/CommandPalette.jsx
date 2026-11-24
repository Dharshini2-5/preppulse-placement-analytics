import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Code2,
  CreditCard,
  Download,
  FileJson,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelBottom,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function CommandPalette({
  open,
  onClose,
  activeTab,
  onNavigate,
  onNavigateSettingsSub,
  onGoSplash,
  onQuickDemo,
  onLogout,
  onRegenerateRecommendations,
  onExportCsv,
  onExportJson,
  showDock,
  onToggleDock,
  currentUser,
}) {
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-overview',
        group: 'Navigation',
        label: 'Overview Dashboard',
        hint: 'Readiness gauge, 5-factor breakdown & radar',
        icon: LayoutDashboard,
        keywords: 'home overview dashboard gauge score',
        active: activeTab === 'overview',
        action: () => onNavigate('overview'),
      },
      {
        id: 'nav-assessments',
        group: 'Navigation',
        label: 'Assessments & Coding Telemetry',
        hint: 'Log tests, sync LeetCode topics & charts',
        icon: Code2,
        keywords: 'assessments coding leetcode dsa tests log',
        active: activeTab === 'assessments',
        action: () => onNavigate('assessments'),
      },
      {
        id: 'nav-simulator',
        group: 'Navigation',
        label: 'What-If Readiness Simulator',
        hint: 'Tune sprint sliders & project target tier',
        icon: SlidersHorizontal,
        keywords: 'simulator what if forecast predict trajectory',
        active: activeTab === 'simulator',
        action: () => onNavigate('simulator'),
      },
      {
        id: 'nav-recommendations',
        group: 'Navigation',
        label: 'AI Preparation Workflows',
        hint: 'Prioritized action plans & milestone boost',
        icon: Sparkles,
        keywords: 'ai recommendations prep workflows plan',
        active: activeTab === 'recommendations',
        action: () => onNavigate('recommendations'),
      },
      {
        id: 'nav-cohort',
        group: 'Navigation',
        label: 'Cohort & RBAC Intelligence',
        hint: 'Leaderboard, mentor coaching & role matrix',
        icon: Users,
        keywords: 'cohort mentor admin rbac leaderboard',
        active: activeTab === 'cohort',
        action: () => onNavigate('cohort'),
      },
      {
        id: 'nav-settings',
        group: 'Navigation',
        label: 'Workspace Settings & Billing',
        hint: 'Appearance, quotas, API keys & audit log',
        icon: Settings,
        keywords: 'settings workspace billing plan preferences',
        active: activeTab === 'settings',
        action: () => onNavigate('settings'),
      },
      {
        id: 'nav-splash',
        group: 'Navigation',
        label: 'Open SaaS Marketing Splash Page',
        hint: 'View hero, pricing tiers & FAQ showcase',
        icon: Home,
        keywords: 'splash landing marketing home pricing',
        action: () => onGoSplash(),
      },

      // Quick Actions
      {
        id: 'act-theme',
        group: 'Actions',
        label: isDark ? 'Switch to Studio Light Mode' : 'Switch to Obsidian Dark Mode',
        hint: 'Instant theme transition across charts & UI',
        icon: isDark ? Sun : Moon,
        keywords: 'theme dark light mode appearance color',
        shortcut: 'Theme',
        action: () => toggleTheme(),
      },
      {
        id: 'act-regen-recs',
        group: 'Actions',
        label: 'Regenerate AI Prep Recommendations',
        hint: 'POST /api/recommendations/generate from live telemetry',
        icon: RefreshCw,
        keywords: 'regenerate refresh ai insights recommendations',
        action: () => onRegenerateRecommendations(),
      },
      {
        id: 'act-export-csv',
        group: 'Actions',
        label: 'Export Readiness Report (CSV)',
        hint: 'Download spreadsheet of scores, coding & workflows',
        icon: Download,
        keywords: 'export download csv spreadsheet report',
        shortcut: '.CSV',
        action: () => onExportCsv(),
      },
      {
        id: 'act-export-json',
        group: 'Actions',
        label: 'Export Full Analytics Payload (JSON)',
        hint: 'Download structured JSON telemetry snapshot',
        icon: FileJson,
        keywords: 'export download json api payload report',
        shortcut: '.JSON',
        action: () => onExportJson(),
      },
      {
        id: 'act-billing',
        group: 'Actions',
        label: 'Manage Plan & Usage Quotas',
        hint: 'View Placement Pro quotas & billing history',
        icon: CreditCard,
        keywords: 'billing plan subscription upgrade invoice quota',
        action: () => onNavigateSettingsSub('billing'),
      },
      {
        id: 'act-apikeys',
        group: 'Actions',
        label: 'Open Developer API Keys & Webhooks',
        hint: 'Generate pp_live keys & ping /api/health',
        icon: KeyRound,
        keywords: 'api keys token developer webhook latency health',
        action: () => onNavigateSettingsSub('api'),
      },
      {
        id: 'act-dock',
        group: 'Actions',
        label: showDock ? 'Hide Floating ReactBits Dock' : 'Show Floating ReactBits Dock',
        hint: 'Toggle bottom magnification dock visibility',
        icon: PanelBottom,
        keywords: 'dock bottom bar toggle hide show',
        action: () => onToggleDock(),
      },

      // RBAC Demo Role Switch
      {
        id: 'role-student',
        group: 'Switch RBAC Role',
        label: 'Switch to STUDENT Demo — Dharshini A',
        hint: 'dharshini@placement.edu • ECE • 512 LC',
        icon: ShieldCheck,
        keywords: 'student dharshini role switch demo login',
        action: () => onQuickDemo('student'),
      },
      {
        id: 'role-mentor',
        group: 'Switch RBAC Role',
        label: 'Switch to MENTOR Demo — Dr. Karthik Sundaram',
        hint: 'mentor@placement.edu • Cohort & Coaching',
        icon: ShieldCheck,
        keywords: 'mentor karthik role switch demo login',
        action: () => onQuickDemo('mentor'),
      },
      {
        id: 'role-admin',
        group: 'Switch RBAC Role',
        label: 'Switch to ADMIN Demo — Placement Cell Director',
        hint: 'admin@placement.edu • Platform Benchmarks & RBAC',
        icon: ShieldCheck,
        keywords: 'admin director role switch demo login',
        action: () => onQuickDemo('admin'),
      },
      ...(currentUser
        ? [
            {
              id: 'role-logout',
              group: 'Switch RBAC Role',
              label: 'Sign Out & Clear JWT Token',
              hint: `Signed in as ${currentUser.email}`,
              icon: LogOut,
              keywords: 'logout sign out exit jwt',
              action: () => onLogout(),
            },
          ]
        : []),
    ],
    [
      activeTab,
      currentUser,
      isDark,
      onExportCsv,
      onExportJson,
      onGoSplash,
      onLogout,
      onNavigate,
      onNavigateSettingsSub,
      onQuickDemo,
      onRegenerateRecommendations,
      onToggleDock,
      showDock,
      toggleTheme,
    ]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.hint.toLowerCase().includes(q) ||
        cmd.group.toLowerCase().includes(q) ||
        cmd.keywords.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((item, flatIdx) => {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group).push({ ...item, flatIdx });
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        const item = filtered[selectedIndex];
        onClose();
        item.action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className={`fixed inset-0 z-[150] flex items-start justify-center px-4 pt-[11vh] backdrop-blur-md ${
            isDark ? 'bg-slate-950/75' : 'bg-slate-900/35'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl glass-panel-strong shadow-2xl"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 border-b border-slate-800/80 px-4 py-3.5">
              <Search className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, tab, role, export, or theme..."
                className="w-full !border-0 !bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
              <kbd
                className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-400'
                    : 'border-slate-200 bg-slate-100 text-slate-500'
                }`}
              >
                ESC
              </kbd>
            </div>

            {/* Command Groups */}
            <div className="max-h-[56vh] overflow-y-auto p-2">
              {grouped.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No matching commands for &ldquo;{query}&rdquo;
                </div>
              ) : (
                grouped.map(([groupName, items]) => (
                  <div key={groupName} className="mb-2 last:mb-0">
                    <div className="px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {groupName}
                    </div>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = item.flatIdx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setSelectedIndex(item.flatIdx)}
                            onClick={() => {
                              onClose();
                              item.action();
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition cursor-pointer ${
                              isSelected
                                ? isDark
                                  ? 'bg-emerald-500/18 text-white ring-1 ring-emerald-400/35'
                                  : 'bg-emerald-50 text-slate-900 ring-1 ring-emerald-500/30'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                                  isSelected
                                    ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                  {item.label}
                                </div>
                                <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                  {item.hint}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {item.active && (
                                <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                  ACTIVE
                                </span>
                              )}
                              {item.shortcut && (
                                <span className="rounded-md border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                  {item.shortcut}
                                </span>
                              )}
                              {isSelected && (
                                <ArrowRight className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Hints */}
            <div
              className={`flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[11px] font-mono ${
                isDark
                  ? 'border-slate-800/80 bg-slate-950/60 text-slate-400'
                  : 'border-slate-200/80 bg-slate-50/90 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Execute</span>
                <span>Esc Close</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400">PrepPulse Command Center</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
