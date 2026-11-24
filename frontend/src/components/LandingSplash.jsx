import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  Cpu,
  Crown,
  Database,
  Globe,
  KeyRound,
  Lock,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import {
  BlurText,
  BorderBeam,
  CountUp,
  DecryptedText,
  GlareHover,
  GradientText,
  Magnet,
  RotatingText,
  ShinyText,
  SplitText,
  SpotlightCard,
  StarBorder,
  TiltedCard,
  TrueFocus,
} from './reactbits';

const CAMPUS_PARTNERS = [
  'Anna University Placement Cell',
  'IIT Madras Research Prep',
  'NIT Trichy Coding Guild',
  'CEG Guindy ECE Cohort',
  'FAANG Interview Collective',
  'PSG Tech Career Labs',
  'VIT Placement Intelligence',
  'Product Engineering Fellows',
];

const SECURITY_PILLARS = [
  { icon: ShieldCheck, label: 'SOC 2 Ready Controls', sub: 'Auditable activity & exports' },
  { icon: KeyRound, label: 'HS256 JWT + RBAC', sub: 'Method-level @PreAuthorize' },
  { icon: Database, label: 'MySQL 8 / H2 Engine', sub: 'Zero-setup & Docker HA' },
  { icon: Server, label: '99.9% Telemetry SLA', sub: 'Sub-20ms REST scoring API' },
];

const FAQ_ITEMS = [
  {
    q: 'How is the Dynamic 5-Factor Placement Readiness Index calculated?',
    a: 'ReadinessScoringService combines recency-weighted assessments (35%), difficulty-weighted LeetCode coding telemetry (30%), Core CS & skill progression velocity (15%), linear regression assessment momentum slope (10%), and CGPA/mock interview baseline (10%)—plus live credit for completed preparation workflows.',
  },
  {
    q: 'How does PrepPulse enforce Student, Mentor, and Admin RBAC permissions?',
    a: 'Every request passes through a stateless Spring Security JwtAuthenticationFilter validating HS256 signed Bearer tokens. Method-level @PreAuthorize rules strictly isolate Student dashboards, Mentor cohort analytics & coaching feedback, and Admin platform benchmarks/role assignments.',
  },
  {
    q: 'Can our university switch from the zero-setup H2 mode to a production MySQL 8 cluster?',
    a: 'Yes! PrepPulse runs out-of-the-box with persistent H2 in MySQL Compatibility Mode and ships with a ready-to-run backend/docker-compose.yml and backend/mysql-schema.sql. Passing --spring.profiles.active=mysql connects directly to MySQL 8.0.',
  },
  {
    q: 'What can mentors and placement cells export or automate via API?',
    a: 'Inside Workspace Settings, Placement Pro and Enterprise teams can generate scoped pp_live_ developer API keys, test live /api/health latency, configure outbound webhook events, and download complete CSV or structured JSON placement readiness reports.',
  },
  {
    q: 'Does PrepPulse support instant Dark & Light Mode switching across charts?',
    a: 'Yes. Every dashboard view, Recharts visualization, modal, drawer, and ReactBits canvas (Aurora, Squares, SpotlightCard, Dock, BorderBeam) adapts smoothly between Obsidian Dark and Porcelain Studio Light Mode with zero flash on reload.',
  },
];

export function LandingSplash({
  telemetry,
  currentUser,
  onLaunchWorkspace,
  onQuickDemo,
  onOpenAuth,
  onSelectPlan,
}) {
  const { isDark } = useTheme();
  const [billingAnnual, setBillingAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  const backendLive = Boolean(telemetry && telemetry.status === 'OPERATIONAL');

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Campus Starter',
      tagline: 'For individual students & study pods building placement momentum.',
      monthlyPrice: 0,
      annualPrice: 0,
      priceDisplay: '$0',
      priceUnit: '/ forever',
      highlighted: false,
      cta: 'Start Free Workspace',
      features: [
        'Dynamic 5-Factor Readiness Gauge',
        'Up to 25 Graded Assessments & Ledger',
        '8 Coding Domain Mastery Trackers',
        'Interactive What-If Sprint Simulator',
        'Dark & Porcelain Light Studio Themes',
      ],
    },
    {
      id: 'pro',
      name: 'Placement Pro',
      tagline: 'For high-growth placement cohorts, mentors & career accelerators.',
      monthlyPrice: 29,
      annualPrice: 23,
      priceDisplay: billingAnnual ? '$23' : '$29',
      priceUnit: '/ month',
      badge: 'MOST POPULAR',
      highlighted: true,
      cta: 'Launch Placement Pro',
      features: [
        'Unlimited Assessments & AI Prep Workflows',
        'Cohort Leaderboard & Mentor Coaching Notes',
        'Developer API Keys (pp_live_) & Webhooks',
        'One-Click CSV & JSON Analytics Reports',
        'Ctrl+K Command Palette & Activity Alerts',
      ],
    },
    {
      id: 'enterprise',
      name: 'University Enterprise',
      tagline: 'Multi-campus deployment with dedicated infrastructure & compliance.',
      monthlyPrice: null,
      annualPrice: null,
      priceDisplay: 'Custom',
      priceUnit: '/ campus SLA',
      highlighted: false,
      cta: 'Provision Enterprise Trial',
      features: [
        'SSO / SAML 2.0 + Custom JWT RBAC Policies',
        'Dedicated MySQL 8.0 HA Cluster & Backups',
        'Unlimited Cohort Seats & Multi-Workspace Tenants',
        '99.9% Uptime SLA & Audit Trail Retention',
        'Dedicated Solutions Architect Onboarding',
      ],
    },
  ];

  const handlePlanClick = (tier) => {
    const planPayload = {
      id: tier.id,
      name: tier.name,
      priceLabel: `${tier.priceDisplay} ${tier.priceUnit}`,
      billing: tier.monthlyPrice === null ? 'ENTERPRISE' : billingAnnual ? 'ANNUAL (-20%)' : 'MONTHLY',
    };
    if (onSelectPlan) {
      onSelectPlan(planPayload);
    } else {
      onOpenAuth();
    }
  };

  return (
    <div className="relative z-10 min-h-screen pb-16">
      {/* Sticky Frosted SaaS Top Navbar */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
          isDark
            ? 'border-slate-800/80 bg-[#050914]/80'
            : 'border-slate-200/85 bg-white/82 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          {/* Brand Logo */}
          <a href="#top" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 shadow-[0_0_24px_rgba(16,185,129,0.22)]">
              <Activity className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                PrepPulse <span className="text-emerald-600 dark:text-emerald-400">Analytics</span>
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400">
                SAAS PLACEMENT INTELLIGENCE
              </div>
            </div>
          </a>

          {/* Smooth-scroll Section Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
              Features
            </a>
            <a href="#analytics" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
              Analytics
            </a>
            <a href="#pricing" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
              Pricing
            </a>
            <a href="#faq" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
              FAQ
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/75 px-3 py-1.5 text-[11px]">
              <span
                className={`h-2 w-2 rounded-full ${
                  backendLive
                    ? 'bg-emerald-400 shadow-[0_0_10px_#10B981]'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="font-mono text-slate-600 dark:text-slate-300">
                {backendLive ? 'API :8081 LIVE' : 'CONNECTING...'}
              </span>
            </div>

            <ThemeToggle />

            {currentUser ? (
              <button
                type="button"
                onClick={onLaunchWorkspace}
                data-keep-light-text="true"
                className="btn-on-accent inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:opacity-95 cursor-pointer"
              >
                <span>Workspace ({currentUser.fullName.split(' ')[0]})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/70 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:border-cyan-400/50 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={onLaunchWorkspace}
                  data-keep-light-text="true"
                  className="btn-on-accent inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:opacity-95 cursor-pointer"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="mx-auto max-w-7xl px-6 pt-12 pb-14 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* Live Telemetry Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex flex-wrap items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <ShinyText className="font-semibold tracking-wide">
                Spring Boot 3.4 • MySQL 8 • JWT HS256 RBAC • Dynamic Scoring SaaS
              </ShinyText>
            </motion.div>

            {/* Dramatic SplitText + RotatingText Headline */}
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              <SplitText text="Quantify & Accelerate" mode="words" />
              <br />
              <GradientText className="mt-1">
                <RotatingText
                  texts={[
                    'Placement Readiness',
                    'Coding Telemetry',
                    'Assessment Momentum',
                    'Offer Conversion',
                  ]}
                  intervalMs={2600}
                />
              </GradientText>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              <BlurText
                text="A multi-workspace placement intelligence platform transforming assessment scores, difficulty-weighted coding activity, and weekly skill trajectories into dynamic readiness indices and prioritized preparation workflows."
                delay={0.025}
              />
            </p>

            {/* TrueFocus Pillar Strip */}
            <div className="mt-7">
              <TrueFocus
                items={['JWT RBAC', 'Dynamic Readiness', 'AI Recommendations', 'What-If Simulator']}
                borderColor="#10B981"
              />
            </div>

            {/* CTAs with Magnet + StarBorder */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Magnet>
                <StarBorder onClick={onLaunchWorkspace} innerClassName="px-6 py-3.5 text-sm sm:text-base">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  <span>{currentUser ? 'Open Analytics Workspace' : 'Launch Analytics Workspace'}</span>
                  <ArrowRight className="h-4 w-4 text-cyan-300" />
                </StarBorder>
              </Magnet>

              <Magnet strength={0.2}>
                <button
                  type="button"
                  onClick={() => onQuickDemo('student')}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3.5 text-sm sm:text-base font-semibold text-cyan-700 dark:text-cyan-200 transition hover:bg-cyan-500/20 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>1-Click Live Demo (Dharshini A)</span>
                </button>
              </Magnet>
            </div>

            {/* Quick RBAC Demo Chips */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono uppercase tracking-wider text-slate-500">Instant Role Preview:</span>
              <button
                type="button"
                onClick={() => onQuickDemo('student')}
                className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-500/20 cursor-pointer"
              >
                STUDENT • Dharshini A
              </button>
              <button
                type="button"
                onClick={() => onQuickDemo('mentor')}
                className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-1 font-medium text-cyan-700 dark:text-cyan-300 transition hover:bg-cyan-500/20 cursor-pointer"
              >
                MENTOR • Dr. Karthik
              </button>
              <button
                type="button"
                onClick={() => onQuickDemo('admin')}
                className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-700 dark:text-amber-300 transition hover:bg-amber-500/20 cursor-pointer"
              >
                ADMIN • Placement Cell
              </button>
            </div>
          </div>

          {/* Right Live Telemetry Hero Card with BorderBeam */}
          <div className="lg:col-span-5">
            <BorderBeam duration="8s" innerClassName="p-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <DecryptedText text="LIVE TELEMETRY SNAPSHOT" />
                  </div>
                  <div className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                    Anna University 2026 Cohort
                  </div>
                </div>
                <span className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                  REST v1
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3.5">
                <GlareHover className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Avg Readiness Index</div>
                  <div className="mt-1 font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    <CountUp to={telemetry?.averageReadinessIndex ?? 76.4} decimals={1} suffix="/100" />
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300/80">
                    Dynamic 5-Factor Model
                  </div>
                </GlareHover>

                <GlareHover className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Assessments Analyzed</div>
                  <div className="mt-1 font-display text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    <CountUp to={telemetry?.assessmentsAnalyzed ?? 51} />
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-cyan-700 dark:text-cyan-300/80">
                    6 Placement Domains
                  </div>
                </GlareHover>

                <GlareHover className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Students Tracked</div>
                  <div className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white">
                    <CountUp to={telemetry?.studentsTracked ?? 6} />
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Multi-Department Cohort
                  </div>
                </GlareHover>

                <GlareHover className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Prep Workflows</div>
                  <div className="mt-1 font-display text-3xl font-bold text-amber-600 dark:text-amber-400">
                    <CountUp to={telemetry?.recommendationsGenerated ?? 24} />
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-amber-700 dark:text-amber-300/80">
                    Priority-Ranked Insights
                  </div>
                </GlareHover>
              </div>

              <div className="mt-5 rounded-xl border border-slate-800/90 bg-slate-950/75 p-3.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400">
                    <Database className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                    Storage Engine
                  </span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300">
                    {telemetry?.databaseMode || 'H2 (MySQL-Compatible Mode)'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    Auth Guard
                  </span>
                  <span className="font-mono text-cyan-700 dark:text-cyan-300">JJWT HS256 + @PreAuthorize</span>
                </div>
              </div>
            </BorderBeam>
          </div>
        </div>
      </section>

      {/* Trusted-By Campus & Placement Partners Marquee */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="overflow-hidden rounded-2xl glass-panel py-5">
          <div className="mb-3.5 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Built for Leading Campus Placement Cells &amp; Product Engineering Cohorts
          </div>
          <div className="relative overflow-hidden">
            <div className="animate-marquee flex items-center gap-5">
              {[...CAMPUS_PARTNERS, ...CAMPUS_PARTNERS].map((partner, idx) => (
                <div
                  key={`${partner}-${idx}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold whitespace-nowrap text-slate-700 dark:text-slate-300"
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features & Architecture Showcase */}
      <section id="features" className="mx-auto max-w-7xl px-6 pt-12">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Platform Architecture
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Engineered for Measurable Placement Outcomes
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Every KPI, score decomposition bar, and preparation action plan is dynamically computed by Spring Boot REST services.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <TiltedCard className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Dynamic Readiness Scoring Engine
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Combines recency-weighted assessments (35%), linear trend momentum slope (10%), difficulty-weighted coding volume &amp; accuracy (30%), Core CS progression (15%), and CGPA/mock baseline (10%).
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="rounded-md bg-slate-800/80 px-2 py-1 text-emerald-700 dark:text-emerald-300">Service ≥ 65</span>
              <span className="rounded-md bg-slate-800/80 px-2 py-1 text-cyan-700 dark:text-cyan-300">Product ≥ 78</span>
              <span className="rounded-md bg-slate-800/80 px-2 py-1 text-amber-700 dark:text-amber-300">FAANG ≥ 88</span>
            </div>
          </TiltedCard>

          <SpotlightCard className="p-6" spotlightColor="rgba(6, 182, 212, 0.22)">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              JWT HS256 &amp; Method-Level RBAC
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Stateless Spring Security filter chain validating signed Bearer tokens with granular <code className="text-cyan-700 dark:text-cyan-300">@PreAuthorize</code> rules separating Student analytics, Mentor cohort coaching, and Admin benchmarks.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
              <Users className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>STUDENT • MENTOR • ADMIN</span>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6" spotlightColor="rgba(245, 158, 11, 0.2)">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Analytics-Driven Prep Workflows
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Automatically diagnoses weakest assessment domains, coding accuracy bottlenecks, and score plateaus to generate prioritized sprint plans—toggling completion recalculates your live Readiness Index.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-amber-700 dark:text-amber-300">
              <Target className="h-3.5 w-3.5" />
              <span>+What-If Readiness Trajectory Simulator</span>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Analytics Capabilities Strip */}
      <section id="analytics" className="mx-auto max-w-7xl px-6 pt-16">
        <SpotlightCard className="p-6 sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                Real-Time Intelligence Suite
              </span>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Built Like Linear &amp; Stripe for Campus Placement Teams
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Navigate instantaneously with the global <code className="rounded bg-slate-800/80 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-300">Ctrl+K</code> command center, switch multi-cohort workspaces, monitor live Spring Boot API latency, and export boardroom-ready CSV/JSON reports.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => onQuickDemo('mentor')}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-500/20 cursor-pointer"
                >
                  <span>Preview Mentor Cohort Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid gap-3.5 sm:grid-cols-2">
              {SECURITY_PILLARS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* SaaS Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 pt-20">
        <div className="text-center">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Transparent SaaS Plans
          </span>
          <h2 className="mt-1.5 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Scale from Individual Prep to Entire Campuses
          </h2>
          <p className="mx-auto mt-2.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Start free with full Readiness Gauge &amp; Simulator analytics, or upgrade to Placement Pro for cohort oversight, developer API keys, and automated reporting.
          </p>

          {/* Animated Monthly / Annual Billing Toggle */}
          <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2">
            <span
              className={`text-xs font-semibold transition ${
                !billingAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingAnnual((prev) => !prev)}
              role="switch"
              aria-checked={billingAnnual}
              aria-label="Toggle annual billing"
              className="relative h-6 w-12 rounded-full bg-emerald-500/25 border border-emerald-500/45 p-0.5 cursor-pointer"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                className={`block h-4.5 w-4.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow ${
                  billingAnnual ? 'ml-auto' : 'mr-auto'
                }`}
              />
            </button>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
                billingAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span>Annual</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Pricing Tier Cards */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => {
            const cardBody = (
              <div className="flex h-full flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {tier.name}
                    </h3>
                    {tier.badge && (
                      <span
                        data-keep-light-text="true"
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm"
                      >
                        <Crown className="h-3 w-3" />
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {tier.tagline}
                  </p>

                  <div className="mt-5 flex items-baseline gap-1.5 border-b border-slate-800/80 pb-5">
                    <span className="font-display text-4xl font-bold text-slate-900 dark:text-white">
                      {tier.priceDisplay}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {tier.priceUnit}
                    </span>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7">
                  {tier.highlighted ? (
                    <StarBorder
                      type="button"
                      onClick={() => handlePlanClick(tier)}
                      className="w-full"
                      innerClassName="w-full py-3 text-sm"
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight className="h-4 w-4 text-cyan-300" />
                    </StarBorder>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePlanClick(tier)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/70 py-3 text-sm font-semibold text-slate-800 dark:text-white transition hover:border-emerald-400/50 cursor-pointer"
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    </button>
                  )}
                </div>
              </div>
            );

            return tier.highlighted ? (
              <BorderBeam key={tier.id} duration="7s" className="lg:-translate-y-2">
                {cardBody}
              </BorderBeam>
            ) : (
              <SpotlightCard key={tier.id}>{cardBody}</SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* Interactive Security & FAQ Accordion */}
      <section id="faq" className="mx-auto max-w-4xl px-6 pt-20">
        <div className="text-center">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
            Security &amp; Architecture FAQ
          </span>
          <h2 className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Frequently Asked Technical Questions
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl glass-panel transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                >
                  <span className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-800/70 px-5 py-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Crisp SaaS Footer */}
      <footer className="mx-auto mt-20 max-w-7xl px-6">
        <div className="rounded-2xl glass-panel p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/35 bg-emerald-500/15">
                  <Activity className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  PrepPulse <span className="text-emerald-600 dark:text-emerald-400">Analytics</span>
                </span>
              </div>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Investor-grade full-stack placement readiness intelligence powered by Spring Boot 3.4, MySQL 8, JWT HS256 RBAC, React 19, and ReactBits.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                <Globe className="h-3.5 w-3.5" />
                <span>All Systems Operational • 99.9% SLA</span>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Platform</div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li><a href="#features" className="hover:text-emerald-500">5-Factor Readiness Engine</a></li>
                <li><a href="#analytics" className="hover:text-emerald-500">Multi-Workspace RBAC</a></li>
                <li><a href="#pricing" className="hover:text-emerald-500">SaaS Pricing Tiers</a></li>
                <li><a href="#faq" className="hover:text-emerald-500">Security &amp; Compliance FAQ</a></li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Stack &amp; Attribution</div>
              <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>
                    Engineered by <strong className="text-slate-900 dark:text-white">Dharshini A</strong> • Anna University
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Backend :8081 • Frontend :5171 • Zero-Setup H2-MySQL &amp; Docker MySQL 8
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
