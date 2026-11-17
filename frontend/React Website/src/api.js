// ─── API Service ────────────────────────────────────────────────────────────
// All calls proxied through Vite: /api → http://localhost:8080

const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('signai_token')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password, mobile) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, mobile }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/auth/me'),
}

// ── Hello (health check) ─────────────────────────────────────────────────────
export const getHello = () => request('/hello')
