import { createContext, useContext, useState, type ReactNode, useCallback } from 'react'
import { clearAuth, getAuth, setAuth, type AuthTokens } from '../lib/authStorage'
import { clearApiDbCache } from '../lib/apiDb'
import { API_BASE } from '../lib/api'

type AuthContextValue = {
  accessToken: string | null
  username: string | null
  login: (login: string, code: string) => Promise<void>
  register: (username: string, email: string, inviteCode: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const messages = Object.values(body as Record<string, unknown>)
      .flat()
      .filter((v) => typeof v === 'string')
    if (messages.length) return messages.join(' ')
  }
  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokensState] = useState<AuthTokens | null>(() => getAuth())

  const login = useCallback(async (loginValue: string, code: string) => {
    const res = await fetch(`${API_BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginValue, password: code }),
    })
    if (!res.ok) {
      throw new Error('Incorrect username/email or code.')
    }
    const data = await res.json()
    const next: AuthTokens = { accessToken: data.access, refreshToken: data.refresh, username: loginValue }
    setAuth(next)
    setTokensState(next)
  }, [])

  const register = useCallback(async (username: string, email: string, inviteCode: string) => {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, inviteCode }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(extractErrorMessage(body, 'Registration failed.'))
    }
    await login(username, inviteCode)
  }, [login])

  const logout = useCallback(() => {
    clearAuth()
    clearApiDbCache()
    setTokensState(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        accessToken: tokens?.accessToken ?? null,
        username: tokens?.username ?? null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
