import { useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, ArrowRight } from 'lucide-react'

export default function Auth() {
  const { accessToken, login, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'signin',
  )
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        await login(username.trim(), code)
      } else {
        await register(username.trim(), email.trim(), code)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text">Welcome to MasterTrack</h1>
          <p className="mt-2 text-center text-sm text-muted">
            {mode === 'signin'
              ? 'Sign in with your username or email and your access code'
              : 'Create your account with the invite code you were given'}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text">
              {mode === 'signin' ? 'Username or email' : 'Username'}
            </label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={mode === 'signin' ? 'you or you@example.com' : 'pick a username'}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-text">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text">
              {mode === 'signin' ? 'Access code' : 'Invite code'}
            </label>
            <input
              required
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={mode === 'signin' ? 'the code you were given' : 'the invite code you were given'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'register' : 'signin')
            setError('')
          }}
          className="mt-6 w-full text-center text-xs text-muted hover:text-text"
        >
          {mode === 'signin'
            ? 'First time? Create an account with an invite code'
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
