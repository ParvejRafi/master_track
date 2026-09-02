export type AuthTokens = {
  accessToken: string
  refreshToken: string
  username: string
}

const STORAGE_KEY = 'mastertrack_auth'

export function getAuth(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuth(tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
