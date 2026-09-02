import { useEffect, useState } from 'react'
import { HardDrive, X } from 'lucide-react'
import db from '../db/schema'
import api from '../lib/api'
import { clearApiDbCache } from '../lib/apiDb'
import { useAuth } from '../context/AuthContext'

const IMPORT_ORDER = [
  'universities',
  'programs',
  'applications',
  'tasks',
  'documents',
  'notes',
  'professors',
  'scholarships',
  'conferences',
] as const

function migrationFlagKey(username: string) {
  return `mastertrack_migrated_${username}`
}

export default function ImportLocalData() {
  const { username } = useAuth()
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!username) return
    if (localStorage.getItem(migrationFlagKey(username))) return

    let cancelled = false
    Promise.all(IMPORT_ORDER.map((table) => db[table].count())).then((counts) => {
      if (!cancelled && counts.some((count) => count > 0)) {
        setVisible(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [username])

  if (!visible || !username) return null

  const dismiss = () => {
    localStorage.setItem(migrationFlagKey(username), '1')
    setVisible(false)
  }

  const handleImport = async () => {
    setBusy(true)
    setError('')
    try {
      const payload: Record<string, unknown[]> = {}
      for (const table of IMPORT_ORDER) {
        payload[table] = await db[table].toArray()
      }
      await api.post('/import/', payload)
      clearApiDbCache()
      dismiss()
    } catch {
      setError('Import failed. You can try again later from here.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft/50 p-4 sm:mx-6 lg:mx-8">
      <div className="rounded-lg bg-primary-soft p-2 text-primary">
        <HardDrive className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-text">Data found on this device</p>
        <p className="mt-0.5 text-sm text-muted">
          We found universities, applications, and other data stored locally in this browser from before accounts existed.
          Import it into your account so it's saved to your account and available on any device?
        </p>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleImport}
            disabled={busy}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            {busy ? 'Importing…' : 'Import my data'}
          </button>
          <button
            onClick={dismiss}
            disabled={busy}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted transition-all hover:bg-surface-hover"
          >
            Skip
          </button>
        </div>
      </div>
      <button onClick={dismiss} disabled={busy} className="text-muted hover:text-text">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
