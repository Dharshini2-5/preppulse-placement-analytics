const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const TOKEN_KEY = 'preppulse_jwt_token';
const USER_KEY = 'preppulse_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const err = new Error(data?.message || data?.error || `Request failed (${response.status})`);
    err.status = response.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  publicStats: () => request('/public/stats'),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request('/auth/me'),

  getDashboard: () => request('/dashboard/me'),

  updateTargetTier: (targetTier) =>
    request('/dashboard/target-tier', {
      method: 'PUT',
      body: JSON.stringify({ targetTier }),
    }),

  simulateReadiness: (payload) =>
    request('/simulator/readiness', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  addAssessment: (payload) =>
    request('/assessments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteAssessment: (id) =>
    request(`/assessments/${id}`, {
      method: 'DELETE',
    }),

  upsertCodingActivity: (payload) =>
    request('/coding', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  generateRecommendations: () =>
    request('/recommendations/generate', {
      method: 'POST',
    }),

  toggleRecommendation: (id) =>
    request(`/recommendations/${id}/toggle`, {
      method: 'PATCH',
    }),

  getCohortOverview: () => request('/cohort/overview'),

  getStudentAnalytics: (studentId) => request(`/cohort/students/${studentId}/analytics`),

  postMentorFeedback: (payload) =>
    request('/cohort/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminBenchmarks: () => request('/admin/benchmarks'),

  updateUserRole: (userId, role) =>
    request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
};
