import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Lock, Mail, ShieldCheck, User, UserPlus, X, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { PillNav, StarBorder } from './reactbits';

const DEMO_ACCOUNTS = [
  {
    key: 'student',
    role: 'STUDENT',
    name: 'Dharshini A',
    subtitle: 'ECE • 512 LC • FAANG Target',
    email: 'dharshini@placement.edu',
    password: 'Student@123',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20',
  },
  {
    key: 'mentor',
    role: 'MENTOR',
    name: 'Dr. Karthik Sundaram',
    subtitle: 'Cohort Oversight & Coaching',
    email: 'mentor@placement.edu',
    password: 'Mentor@123',
    badgeClass: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20',
  },
  {
    key: 'admin',
    role: 'ADMIN',
    name: 'Placement Cell Director',
    subtitle: 'Benchmarks & RBAC Admin',
    email: 'admin@placement.edu',
    password: 'Admin@123',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20',
  },
];

export function AuthModal({ open, onClose, onAuthSuccess, selectedPlan = null }) {
  const { isDark } = useTheme();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('dharshini@placement.edu');
  const [password, setPassword] = useState('Student@123');

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [batchYear, setBatchYear] = useState(2026);
  const [cgpa, setCgpa] = useState(8.3);
  const [targetTier, setTargetTier] = useState('PRODUCT');
  const [role, setRole] = useState('STUDENT');

  const handleLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.login(loginEmail, loginPassword);
      onAuthSuccess(data, selectedPlan);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      await handleLogin(email, password);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.register({
        fullName,
        email,
        password,
        department,
        batchYear: Number(batchYear),
        cgpa: Number(cgpa),
        targetTier,
        role,
      });
      onAuthSuccess(data, selectedPlan);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full rounded-xl border py-2 text-sm outline-none transition focus:border-emerald-500 ${
    isDark
      ? 'border-slate-700/80 bg-slate-900/80 text-white'
      : 'border-slate-200 bg-white text-slate-900 shadow-2xs'
  }`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md ${
            isDark ? 'bg-slate-950/80' : 'bg-slate-900/35'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl glass-panel-strong p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              aria-label="Close auth modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-500 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  JWT RBAC Access Gate
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Signed HS256 authentication with Student, Mentor & Admin roles
                </p>
              </div>
            </div>

            {selectedPlan && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                      Selected Tier: {selectedPlan.name}
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                      ({selectedPlan.priceLabel})
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  {selectedPlan.billing || 'PROVISION'}
                </span>
              </div>
            )}

            {/* 1-Click Demo Login Chips */}
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                <span>1-Click Role Demo Sign-In</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.key}
                    type="button"
                    disabled={loading}
                    onClick={() => handleLogin(acc.email, acc.password)}
                    className={`rounded-xl border p-2.5 text-left transition cursor-pointer disabled:opacity-50 ${acc.badgeClass}`}
                  >
                    <div className="text-[10px] font-mono font-bold tracking-wider">{acc.role}</div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </div>
                    <div className="mt-0.5 text-[10px] opacity-80 truncate">{acc.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex justify-center">
              <PillNav
                layoutGroup="auth-mode"
                activeId={mode}
                onSelect={(id) => {
                  setMode(id);
                  setError('');
                }}
                items={[
                  { id: 'login', label: 'Sign In', icon: Lock },
                  { id: 'register', label: 'Register Account', icon: UserPlus },
                ]}
              />
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ananya Ramesh"
                      className={`${inputClass} pr-3 pl-9`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@placement.edu"
                    className={`${inputClass} pr-3 pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-3 pl-9`}
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={`${inputClass} px-3`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      CGPA
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className={`${inputClass} px-3`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Target Tier
                    </label>
                    <select
                      value={targetTier}
                      onChange={(e) => setTargetTier(e.target.value)}
                      className={`${inputClass} px-3`}
                    >
                      <option value="SERVICE">Service (≥ 65)</option>
                      <option value="PRODUCT">Product (≥ 78)</option>
                      <option value="FAANG">FAANG / Dream (≥ 88)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`${inputClass} px-3`}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="MENTOR">Mentor</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <StarBorder
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  innerClassName="w-full py-3 text-sm"
                >
                  {loading
                    ? 'Authenticating with Spring Security...'
                    : mode === 'login'
                    ? 'Sign In & Issue JWT Token'
                    : 'Create Account & Bootstrap Analytics'}
                </StarBorder>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
