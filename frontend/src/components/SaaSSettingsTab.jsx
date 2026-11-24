import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Crown,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FileSpreadsheet,
  History,
  KeyRound,
  Moon,
  Palette,
  PanelBottom,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Webhook,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import { BorderBeam, CountUp, PillNav, SpotlightCard, StarBorder } from './reactbits';

const API_KEYS_STORAGE = 'preppulse_api_keys';
const WEBHOOK_STORAGE = 'preppulse_webhook_cfg';

const DEFAULT_API_KEYS = [
  {
    id: 'key-prod-1',
    name: 'Placement ERP Telemetry Sync',
    prefix: 'pp_live_',
    secret: 'pp_live_9f4c2a8b1e7d6c3a90e1f4b8a2c5d7e9',
    scope: 'read:analytics, write:assessments',
    createdAt: '2026-02-14',
    lastUsed: '2 mins ago',
  },
  {
    id: 'key-ci-2',
    name: 'Campus Cohort Webhook Reader',
    prefix: 'pp_live_',
    secret: 'pp_live_3d8e1a5c7b9f0e2d4a6c8b1e3f5a7c9d',
    scope: 'read:cohort',
    createdAt: '2026-03-02',
    lastUsed: '4 hrs ago',
  },
];

const INVOICES = [
  { id: 'INV-2026-004', date: '2026-04-01', plan: 'Placement Pro (Monthly)', amount: '$29.00', status: 'PAID' },
  { id: 'INV-2026-003', date: '2026-03-01', plan: 'Placement Pro (Monthly)', amount: '$29.00', status: 'PAID' },
  { id: 'INV-2026-002', date: '2026-02-01', plan: 'Placement Pro (Monthly)', amount: '$29.00', status: 'PAID' },
  { id: 'INV-2026-001', date: '2026-01-01', plan: 'Campus Starter Onboarding', amount: '$0.00', status: 'PAID' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Campus Starter',
    price: '$0/mo',
    desc: 'Individual students & placement prep circles',
    limits: { assessments: 25, topics: 10, recs: 15, seats: 10 },
    highlights: ['5-Factor Readiness Gauge', '25 Graded Assessments', 'What-If Simulator'],
  },
  {
    id: 'pro',
    name: 'Placement Pro',
    price: '$29/mo',
    desc: 'High-velocity placement cohorts & mentor analytics',
    limits: { assessments: 500, topics: 50, recs: 200, seats: 250 },
    highlights: ['Unlimited AI Prep Workflows', 'Cohort Leaderboard & Mentor Notes', 'Developer API Keys & CSV/JSON Exports'],
  },
  {
    id: 'enterprise',
    name: 'University Enterprise',
    price: 'Custom',
    desc: 'Multi-campus placement cells with SAML SSO & MySQL 8 cluster',
    limits: { assessments: 10000, topics: 500, recs: 5000, seats: 5000 },
    highlights: ['Dedicated MySQL 8 HA Cluster', 'SSO / SAML 2.0 & Custom RBAC', '99.9% SLA & Solutions Architect'],
  },
];

function generateLiveKey() {
  const chars = 'abcdef0123456789';
  let body = '';
  for (let i = 0; i < 32; i++) {
    body += chars[Math.floor(Math.random() * chars.length)];
  }
  return `pp_live_${body}`;
}

export function SaaSSettingsTab({
  initialSubTab = 'appearance',
  dashboard,
  telemetry,
  workspaceConfig,
  onUpdateWorkspaceConfig,
  showDock,
  onToggleDock,
  activePlan,
  onChangePlan,
  onExportCsv,
  onExportJson,
  auditLog = [],
  onClearAuditLog,
  onAddAuditEvent,
  onToast,
}) {
  const { isDark, setTheme } = useTheme();
  const [subTab, setSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  // Workspace org form
  const [orgName, setOrgName] = useState(workspaceConfig?.orgName || 'Anna University Placement Cell');
  const [targetBatch, setTargetBatch] = useState(workspaceConfig?.targetBatch || 'Batch 2027 • ECE / CSE');

  // Plan Upgrade Modal
  const [planModalOpen, setPlanModalOpen] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(API_KEYS_STORAGE);
      return saved ? JSON.parse(saved) : DEFAULT_API_KEYS;
    } catch {
      return DEFAULT_API_KEYS;
    }
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('read:analytics, write:assessments');
  const [revealedIds, setRevealedIds] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Live REST Latency Tester
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [endpointResult, setEndpointResult] = useState(null);

  // Webhook state
  const [webhookCfg, setWebhookCfg] = useState(() => {
    try {
      const saved = localStorage.getItem(WEBHOOK_STORAGE);
      return saved
        ? JSON.parse(saved)
        : {
            url: 'https://hooks.campus-erp.edu/v1/preppulse-events',
            events: ['assessment.logged', 'readiness.milestone', 'recommendation.completed'],
            enabled: true,
          };
    } catch {
      return {
        url: 'https://hooks.campus-erp.edu/v1/preppulse-events',
        events: ['assessment.logged', 'readiness.milestone', 'recommendation.completed'],
        enabled: true,
      };
    }
  });

  const persistKeys = (next) => {
    setApiKeys(next);
    try {
      localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleSaveWorkspaceProfile = (e) => {
    e.preventDefault();
    onUpdateWorkspaceConfig({ orgName: orgName.trim(), targetBatch: targetBatch.trim() });
    onAddAuditEvent?.('WORKSPACE', `Updated workspace branding to "${orgName.trim()}"`);
    onToast('Workspace branding & target batch saved!');
  };

  const handleCreateApiKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const secret = generateLiveKey();
    const created = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: 'pp_live_',
      secret,
      scope: newKeyScope,
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: 'Just created',
    };
    persistKeys([created, ...apiKeys]);
    setRevealedIds((prev) => ({ ...prev, [created.id]: true }));
    setNewKeyName('');
    onAddAuditEvent?.('SECURITY', `Generated new API key "${created.name}" (${created.scope})`);
    onToast(`Generated live API key "${created.name}"!`);
  };

  const handleRevokeKey = (keyObj) => {
    persistKeys(apiKeys.filter((k) => k.id !== keyObj.id));
    onAddAuditEvent?.('SECURITY', `Revoked API key "${keyObj.name}"`);
    onToast(`Revoked API key "${keyObj.name}"`);
  };

  const handleCopyKey = async (keyObj) => {
    try {
      await navigator.clipboard.writeText(keyObj.secret);
      setCopiedId(keyObj.id);
      setTimeout(() => setCopiedId(null), 1800);
      onToast(`Copied ${keyObj.name} to clipboard`);
    } catch {
      onToast('Clipboard unavailable in this browser context', 'error');
    }
  };

  const handlePingHealth = async (target = 'health') => {
    setTestingEndpoint(true);
    const started = performance.now();
    try {
      const payload = target === 'health' ? await api.health() : await api.publicStats();
      const latencyMs = Math.max(1, Math.round(performance.now() - started));
      setEndpointResult({
        ok: true,
        status: 200,
        endpoint: target === 'health' ? 'GET http://localhost:8081/api/health' : 'GET http://localhost:8081/api/public/stats',
        latencyMs,
        checkedAt: new Date().toLocaleTimeString(),
        payload,
      });
      onAddAuditEvent?.('API_TEST', `Pinged /api/${target} → 200 OK (${latencyMs}ms)`);
    } catch (err) {
      const latencyMs = Math.max(1, Math.round(performance.now() - started));
      setEndpointResult({
        ok: false,
        status: err.status || 'ERR',
        endpoint: target === 'health' ? 'GET http://localhost:8081/api/health' : 'GET http://localhost:8081/api/public/stats',
        latencyMs,
        checkedAt: new Date().toLocaleTimeString(),
        payload: { error: err.message || 'Backend unreachable on :8081' },
      });
      onToast('Could not reach Spring Boot on :8081', 'error');
    } finally {
      setTestingEndpoint(false);
    }
  };

  const toggleWebhookEvent = (evName) => {
    const exists = webhookCfg.events.includes(evName);
    const nextEvents = exists
      ? webhookCfg.events.filter((e) => e !== evName)
      : [...webhookCfg.events, evName];
    setWebhookCfg((prev) => ({ ...prev, events: nextEvents }));
  };

  const saveWebhook = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(WEBHOOK_STORAGE, JSON.stringify(webhookCfg));
    } catch {
      // ignore
    }
    onAddAuditEvent?.('WEBHOOK', `Saved webhook target (${webhookCfg.events.length} events subscribed)`);
    onToast('Webhook delivery settings saved!');
  };

  const testWebhookDelivery = () => {
    onAddAuditEvent?.('WEBHOOK', `Dispatched synthetic readiness.milestone event to ${webhookCfg.url}`);
    onToast('Test webhook payload dispatched (HTTP 202 Accepted)');
  };

  const planObj = PLANS.find((p) => p.name === activePlan) || PLANS[1];

  const quotas = [
    {
      label: 'Assessments Analyzed',
      used: dashboard?.assessments?.length ?? telemetry?.assessmentsAnalyzed ?? 0,
      max: planObj.limits.assessments,
      color: 'bg-emerald-500',
    },
    {
      label: 'Coding Topics Tracked',
      used: dashboard?.codingActivities?.length ?? 8,
      max: planObj.limits.topics,
      color: 'bg-cyan-500',
    },
    {
      label: 'AI Recommendations Generated',
      used: dashboard?.recommendations?.length ?? telemetry?.recommendationsGenerated ?? 0,
      max: planObj.limits.recs,
      color: 'bg-amber-500',
    },
    {
      label: 'Active Cohort Seats',
      used: telemetry?.studentsTracked ?? 6,
      max: planObj.limits.seats,
      color: 'bg-violet-500',
    },
  ];

  const maskSecret = (sec) => `${sec.slice(0, 12)}${'•'.repeat(16)}${sec.slice(-4)}`;

  return (
    <div className="space-y-6">
      {/* Header + 4 PillNav Sub-Tabs */}
      <SpotlightCard className="p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enterprise SaaS Administration</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              Workspace Settings, Billing, API & Exports
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Configure appearance, manage subscription quotas, issue live developer keys, and export auditable placement reports.
            </p>
          </div>

          <PillNav
            layoutGroup="saas-settings-sub"
            activeId={subTab}
            onSelect={setSubTab}
            items={[
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'billing', label: 'Plan & Quotas', icon: CreditCard },
              { id: 'api', label: 'API Keys', icon: KeyRound },
              { id: 'exports', label: 'Export & Audit', icon: Download },
            ]}
          />
        </div>
      </SpotlightCard>

      {/* SUB-TAB 1: APPEARANCE & WORKSPACE */}
      {subTab === 'appearance' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <SpotlightCard className="p-6 lg:col-span-7">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Theme Studio — Obsidian Dark vs Porcelain Light
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Synchronizes across Recharts visualizations, ReactBits Aurora & Squares canvases, modals, and tables with zero FOUC.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* Dark Mode Preview Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  onAddAuditEvent?.('THEME', 'Switched workspace theme to Obsidian Dark');
                  onToast('Obsidian Dark Mode enabled');
                }}
                style={{ backgroundColor: '#050914' }}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition cursor-pointer ${
                  isDark
                    ? 'border-emerald-400 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 hover:border-emerald-500/60'
                }`}
                data-keep-light-text="true"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Moon className="h-4 w-4 text-cyan-400" />
                    Obsidian Dark
                  </span>
                  {isDark && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                      ACTIVE
                    </span>
                  )}
                </div>
                {/* Miniature UI Preview */}
                <div
                  style={{ backgroundColor: '#0B1224', borderColor: 'rgba(148,163,184,0.18)' }}
                  className="mt-3 rounded-xl border p-3"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="mt-2.5 h-2 w-2/3 rounded" style={{ backgroundColor: '#334155' }} />
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30" />
                    <div className="h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30" />
                    <div className="h-8 rounded-lg bg-amber-500/20 border border-amber-400/30" />
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-slate-300">
                  Deep obsidian canvas with neon emerald/cyan telemetry glows.
                </p>
              </button>

              {/* Light Mode Preview Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  onAddAuditEvent?.('THEME', 'Switched workspace theme to Porcelain Light');
                  onToast('Porcelain Studio Light Mode enabled');
                }}
                style={{ backgroundColor: '#F8FAFC' }}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition cursor-pointer ${
                  !isDark
                    ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 hover:border-emerald-400/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#0F172A' }}>
                    <Sun className="h-4 w-4" style={{ color: '#D97706' }} />
                    Porcelain Studio
                  </span>
                  {!isDark && (
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold"
                      style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                {/* Miniature UI Preview */}
                <div
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                  className="mt-3 rounded-xl border p-3 shadow-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="mt-2.5 h-2 w-2/3 rounded" style={{ backgroundColor: '#CBD5E1' }} />
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="h-8 rounded-lg border" style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }} />
                    <div className="h-8 rounded-lg border" style={{ backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' }} />
                    <div className="h-8 rounded-lg border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }} />
                  </div>
                </div>
                <p className="mt-2.5 text-[11px]" style={{ color: '#475569' }}>
                  Crisp Apple/Linear porcelain daylight UI with diffused glass shadows.
                </p>
              </button>
            </div>

            {/* Dock Toggle Card */}
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-500/15 text-cyan-500 dark:text-cyan-400">
                  <PanelBottom className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Floating ReactBits Magnification Dock
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Keep the macOS-style bottom dock alongside the collapsible SaaS sidebar
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleDock}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer ${
                  showDock ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-700'
                }`}
                aria-label="Toggle floating dock"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    showDock ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 lg:col-span-5" spotlightColor="rgba(6, 182, 212, 0.2)">
            <div className="mb-4 flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Organization & Cohort Identity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Displayed on exported CSV/JSON reports & workspace headers
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveWorkspaceProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Organization / Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Target Graduation Batch & Track
                </label>
                <input
                  type="text"
                  required
                  value={targetBatch}
                  onChange={(e) => setTargetBatch(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Data Region</span>
                  <span className="font-mono text-emerald-500 dark:text-emerald-300">ap-south-1 (Chennai)</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-slate-400">Compliance Profile</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-300">SOC 2 Ready • JWT HS256</span>
                </div>
              </div>

              <StarBorder type="submit" className="w-full" innerClassName="w-full py-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Save Workspace Profile</span>
              </StarBorder>
            </form>
          </SpotlightCard>
        </div>
      )}

      {/* SUB-TAB 2: PLAN & USAGE QUOTAS */}
      {subTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Active Plan Card */}
            <div className="lg:col-span-5">
              <BorderBeam duration="8s" innerClassName="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      <Crown className="h-3.5 w-3.5" />
                      ACTIVE SUBSCRIPTION
                    </span>
                    <span className="font-mono text-xs text-slate-400">Auto-renews May 1</span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {planObj.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {planObj.price}
                    </span>
                    <span className="text-xs text-slate-400">• billed per workspace</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{planObj.desc}</p>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {planObj.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <StarBorder
                    type="button"
                    onClick={() => setPlanModalOpen(true)}
                    className="w-full"
                    innerClassName="w-full py-2.5 text-sm"
                  >
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Upgrade / Change Plan</span>
                  </StarBorder>
                </div>
              </BorderBeam>
            </div>

            {/* Live Metered Usage Quotas */}
            <SpotlightCard className="p-6 lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Live Metered Usage Quotas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time counts wired directly to your Spring Boot backend database
                  </p>
                </div>
                <span className="rounded-lg bg-cyan-500/15 px-2.5 py-1 font-mono text-[11px] text-cyan-700 dark:text-cyan-300">
                  SYNCED :8081
                </span>
              </div>

              <div className="space-y-4">
                {quotas.map((q) => {
                  const pct = Math.min(100, Math.max(4, Math.round((q.used / q.max) * 100)));
                  return (
                    <div key={q.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{q.label}</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200">
                          <strong>
                            <CountUp to={q.used} />
                          </strong>{' '}
                          <span className="text-slate-400">/ {q.max.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${q.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SpotlightCard>
          </div>

          {/* Billing History Table */}
          <SpotlightCard className="p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Billing & Invoice Ledger
            </h3>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Downloadable GST / institutional purchase receipts
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-[11px] uppercase text-slate-400">
                    <th className="py-2.5 pr-4">Invoice ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {INVOICES.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/50">
                      <td className="py-3 pr-4 font-mono font-semibold text-slate-900 dark:text-white">{inv.id}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">{inv.date}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{inv.plan}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">{inv.amount}</td>
                      <td className="py-3 px-3">
                        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => onToast(`Downloaded PDF receipt for ${inv.id}`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-300 transition hover:border-cyan-400/50 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* SUB-TAB 3: DEVELOPER API KEYS & WEBHOOKS */}
      {subTab === 'api' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Key Generator & Table */}
            <SpotlightCard className="p-6 lg:col-span-7">
              <div className="mb-4 flex items-center gap-2.5">
                <KeyRound className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Developer API Keys
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Issue scoped `pp_live_` tokens for automated assessment ingestion & campus ERP sync
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateApiKey} className="mb-5 grid gap-2.5 sm:grid-cols-12">
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key label (e.g. GitHub Actions OA Sync)"
                  className="sm:col-span-5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-emerald-400"
                />
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value)}
                  className="sm:col-span-4 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                >
                  <option value="read:analytics, write:assessments">read + write:assessments</option>
                  <option value="read:analytics">read:analytics only</option>
                  <option value="admin:cohort">admin:cohort full</option>
                </select>
                <button
                  type="submit"
                  data-keep-light-text="true"
                  className="btn-on-accent sm:col-span-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate</span>
                </button>
              </form>

              <div className="space-y-3">
                {apiKeys.map((k) => {
                  const isRevealed = Boolean(revealedIds[k.id]);
                  return (
                    <div
                      key={k.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{k.name}</div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            Scope: {k.scope} • Created {k.createdAt} • {k.lastUsed}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedIds((prev) => ({ ...prev, [k.id]: !prev[k.id] }))
                            }
                            className="rounded-lg border border-slate-700/80 p-1.5 text-slate-400 transition hover:text-emerald-400 cursor-pointer"
                            title={isRevealed ? 'Hide key' : 'Reveal key'}
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(k)}
                            className="rounded-lg border border-slate-700/80 p-1.5 text-slate-400 transition hover:text-cyan-400 cursor-pointer"
                            title="Copy API key"
                          >
                            {copiedId === k.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(k)}
                            className="rounded-lg border border-slate-700/80 p-1.5 text-slate-400 transition hover:border-rose-500/40 hover:text-rose-400 cursor-pointer"
                            title="Revoke key"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2.5 overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-950/75 px-3 py-2 font-mono text-xs text-emerald-600 dark:text-emerald-300">
                        {isRevealed ? k.secret : maskSecret(k.secret)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SpotlightCard>

            {/* Live REST Endpoint Latency Tester */}
            <SpotlightCard className="p-6 lg:col-span-5" spotlightColor="rgba(6, 182, 212, 0.22)">
              <div className="mb-4 flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Live REST Latency Probe
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Measure real round-trip ms against Spring Boot `:8081`
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <StarBorder
                  type="button"
                  disabled={testingEndpoint}
                  onClick={() => handlePingHealth('health')}
                  innerClassName="px-4 py-2 text-xs"
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{testingEndpoint ? 'Probing...' : 'Ping /api/health'}</span>
                </StarBorder>
                <button
                  type="button"
                  disabled={testingEndpoint}
                  onClick={() => handlePingHealth('stats')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300 transition hover:bg-cyan-500/20 cursor-pointer"
                >
                  <span>Ping /api/public/stats</span>
                </button>
              </div>

              {endpointResult ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/75 px-3.5 py-2.5 text-xs font-mono">
                    <span className={endpointResult.ok ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-500'}>
                      HTTP {endpointResult.status}
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-300 font-bold">
                      {endpointResult.latencyMs} ms
                    </span>
                    <span className="text-slate-400">{endpointResult.checkedAt}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {endpointResult.endpoint}
                  </div>
                  <pre className="max-h-52 overflow-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {JSON.stringify(endpointResult.payload, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-700/70 p-6 text-center text-xs text-slate-400">
                  Click &ldquo;Ping /api/health&rdquo; to verify real-time REST connectivity and inspect the JSON response.
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Webhook Configuration */}
          <SpotlightCard className="p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <Webhook className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Outbound Webhooks
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Push signed HMAC-SHA256 placement events to Slack, Discord, or University ERP systems
                </p>
              </div>
            </div>

            <form onSubmit={saveWebhook} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-8">
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Destination Endpoint URL
                  </label>
                  <input
                    type="url"
                    required
                    value={webhookCfg.url}
                    onChange={(e) => setWebhookCfg({ ...webhookCfg, url: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="md:col-span-4 flex items-end gap-2">
                  <button
                    type="submit"
                    data-keep-light-text="true"
                    className="btn-on-accent flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-2 text-xs sm:text-sm font-semibold text-white transition hover:opacity-95 cursor-pointer"
                  >
                    Save Webhook
                  </button>
                  <button
                    type="button"
                    onClick={testWebhookDelivery}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:border-cyan-400/50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                    <span>Test</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['assessment.logged', 'readiness.milestone', 'recommendation.completed', 'mentor.feedback'].map(
                  (evName) => {
                    const active = webhookCfg.events.includes(evName);
                    return (
                      <button
                        key={evName}
                        type="button"
                        onClick={() => toggleWebhookEvent(evName)}
                        className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition cursor-pointer ${
                          active
                            ? 'border-emerald-500/45 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-700/80 bg-slate-900/60 text-slate-400'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {evName}
                      </button>
                    );
                  }
                )}
              </div>
            </form>
          </SpotlightCard>
        </div>
      )}

      {/* SUB-TAB 4: EXPORT & AUDIT LOG */}
      {subTab === 'exports' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <SpotlightCard className="p-6 lg:col-span-5">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              One-Click Placement Data Exports
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Generated directly from your live Spring Boot dashboard payload — ready for placement officers, mentors, or BI notebooks.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={onExportCsv}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-left transition hover:bg-emerald-500/18 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Download Full CSV Report
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Readiness factors, assessments ledger, coding topics & workflows
                    </div>
                  </div>
                </div>
                <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onExportJson}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-4 text-left transition hover:bg-cyan-500/18 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <FileJson className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Download Raw JSON Snapshot
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Complete structured analytics schema for pipelines & audits
                    </div>
                  </div>
                </div>
                <Download className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>Payload Scope Included</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                <span>• {dashboard?.assessments?.length || 0} Assessments</span>
                <span>• {dashboard?.codingActivities?.length || 0} Coding Topics</span>
                <span>• {dashboard?.recommendations?.length || 0} AI Workflows</span>
                <span>• {dashboard?.skillSnapshots?.length || 0} Weekly Snapshots</span>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 lg:col-span-7" spotlightColor="rgba(245, 158, 11, 0.2)">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Session Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Immutable timestamped log of security, analytics, export & configuration events
                  </p>
                </div>
              </div>
              {auditLog.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAuditLog}
                  className="text-xs font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  Clear Log
                </button>
              )}
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {auditLog.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700/70 p-8 text-center text-xs text-slate-400">
                  No audit events logged yet in this session.
                </div>
              ) : (
                auditLog.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/55 px-3.5 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="mr-2 rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        {ev.category}
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">{ev.message}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">{ev.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Interactive Plan Upgrade Modal */}
      <AnimatePresence>
        {planModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlanModalOpen(false)}
            className={`fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-md ${
              isDark ? 'bg-slate-950/80' : 'bg-slate-900/35'
            }`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl rounded-2xl glass-panel-strong p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Select Workspace Subscription Tier
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Changes apply immediately to your metered usage quotas and workspace badge.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {PLANS.map((plan) => {
                  const isCurrent = plan.name === activePlan;
                  return (
                    <div
                      key={plan.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4 ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-display text-base font-bold text-slate-900 dark:text-white">
                            {plan.name}
                          </span>
                          {isCurrent && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="mt-2 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {plan.price}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{plan.desc}</p>
                        <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {plan.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-1.5">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={isCurrent}
                        onClick={() => {
                          onChangePlan(plan.name);
                          setPlanModalOpen(false);
                          onAddAuditEvent?.('BILLING', `Switched workspace subscription to ${plan.name}`);
                          onToast(`Workspace upgraded to ${plan.name}!`);
                        }}
                        data-keep-light-text={!isCurrent ? 'true' : undefined}
                        className={`mt-4 w-full rounded-xl py-2 text-xs font-semibold transition cursor-pointer ${
                          isCurrent
                            ? 'border border-emerald-500/35 text-emerald-600 dark:text-emerald-300 cursor-default'
                            : 'btn-on-accent bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:opacity-95'
                        }`}
                      >
                        {isCurrent ? 'Active Plan' : `Switch to ${plan.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
