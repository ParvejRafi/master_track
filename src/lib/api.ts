import { clearAuth, getAuth, setAuth } from './authStorage'

// In dev, Vite proxies /api to the local Django server (see vite.config.ts).
// In production the frontend and backend are separate deployments, so
// VITE_API_BASE_URL must point at the backend's own origin.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function refreshAccessToken(): Promise<string | null> {
  const auth = getAuth()
  if (!auth?.refreshToken) return null

  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: auth.refreshToken }),
  })
  if (!res.ok) return null

  const data = await res.json()
  setAuth({ ...auth, accessToken: data.access, refreshToken: data.refresh ?? auth.refreshToken })
  return data.access
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const auth = getAuth()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401 && !retried && auth?.refreshToken) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      return request<T>(path, options, true)
    }
    clearAuth()
    window.location.href = '/login'
    throw new Error('Session expired. Please sign in again.')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with status ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}

export default api
