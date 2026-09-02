import { useEffect, useState } from 'react'
import { Download, Moon, Sun, Shield, HardDrive, Upload, Bell } from 'lucide-react'
import api from '../lib/api'
import { clearApiDbCache } from '../lib/apiDb'
import db from '../db/schema'

type NotificationSettings = {
  email_reminders_enabled: boolean
  remind_days_ahead: number
  last_sent_at: string | null
}

const LOCAL_TABLES = [
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

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )
  const [message, setMessage] = useState('')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [localCount, setLocalCount] = useState<number | null>(null)
  const [migratingLocal, setMigratingLocal] = useState(false)
  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null)
  const [savingNotif, setSavingNotif] = useState(false)

  useEffect(() => {
    Promise.all(LOCAL_TABLES.map((table) => db[table].count())).then((counts) => {
      setLocalCount(counts.reduce((a, b) => a + b, 0))
    })
  }, [])

  useEffect(() => {
    api.get<NotificationSettings>('/auth/notifications/settings/').then(setNotifSettings)
  }, [])

  const saveNotifSettings = async (next: Partial<NotificationSettings>) => {
    if (!notifSettings) return
    const merged = { ...notifSettings, ...next }
    setNotifSettings(merged)
    setSavingNotif(true)
    try {
      const saved = await api.patch<NotificationSettings>('/auth/notifications/settings/', next)
      setNotifSettings(saved)
    } finally {
      setSavingNotif(false)
    }
  }

  const handleImportLocal = async () => {
    setMigratingLocal(true)
    try {
      const payload: Record<string, unknown[]> = {}
      for (const table of LOCAL_TABLES) {
        payload[table] = await db[table].toArray()
      }
      await api.post('/import/', payload)
      clearApiDbCache()
      setMessage('Local browser data imported into your account!')
      setTimeout(() => setMessage(''), 4000)
      window.location.reload()
    } catch {
      setMessage('Import failed. Please try again.')
      setTimeout(() => setMessage(''), 4000)
    } finally {
      setMigratingLocal(false)
    }
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await api.get('/export/')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mastertrack-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage('Backup exported successfully!')
      setTimeout(() => setMessage(''), 4000)
    } finally {
      setExporting(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (confirm('This will add the backup\'s records to your account. Are you sure?')) {
          await api.post('/import/', data)
          clearApiDbCache()
          setMessage('Data imported successfully!')
          setTimeout(() => setMessage(''), 4000)
          window.location.reload()
        }
      } catch {
        setMessage('Invalid backup file.')
        setTimeout(() => setMessage(''), 4000)
      } finally {
        setImporting(false)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text tracking-tight">Settings</h1>
        <p className="mt-2 text-muted">Manage your preferences and data</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary-soft p-2 text-primary">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Appearance</h2>
                <p className="text-sm text-muted">Customize how MasterTrack looks</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold text-text">Theme</p>
                <p className="mt-0.5 text-sm text-muted">Switch between light and dark mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text transition-all duration-200 hover:bg-surface-hover active:scale-95"
              >
                {theme === 'light' ? (
                  <><Moon className="h-4 w-4" /> Dark</>
                ) : (
                  <><Sun className="h-4 w-4" /> Light</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success-soft p-2 text-success">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Data Management</h2>
                <p className="text-sm text-muted">Export or import your data</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold text-text">Export Backup</p>
                <p className="mt-0.5 text-sm text-muted">Download all data as JSON</p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold text-text">Import Backup</p>
                <p className="mt-0.5 text-sm text-muted">Restore data from JSON backup</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-hover px-4 py-2.5 text-sm font-semibold text-text transition-all duration-200 hover:bg-border active:scale-95">
                {importing ? 'Importing...' : 'Import'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm lg:col-span-2">
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-danger-soft p-2 text-danger">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Deadline Reminders</h2>
                <p className="text-sm text-muted">Get an email digest of upcoming deadlines and tasks</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {!notifSettings ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-semibold text-text">Email Reminders</p>
                    <p className="mt-0.5 text-sm text-muted">
                      Daily digest of applications, tasks, scholarships and conferences with dates coming up
                    </p>
                  </div>
                  <button
                    onClick={() => saveNotifSettings({ email_reminders_enabled: !notifSettings.email_reminders_enabled })}
                    disabled={savingNotif}
                    className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                      notifSettings.email_reminders_enabled ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        notifSettings.email_reminders_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-semibold text-text">Remind Me</p>
                    <p className="mt-0.5 text-sm text-muted">How many days ahead of a date to start reminding you</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={notifSettings.remind_days_ahead}
                      onChange={(e) => setNotifSettings({ ...notifSettings, remind_days_ahead: Number(e.target.value) })}
                      onBlur={(e) => saveNotifSettings({ remind_days_ahead: Number(e.target.value) })}
                      disabled={!notifSettings.email_reminders_enabled || savingNotif}
                      className="w-16 rounded-xl border border-border bg-page px-3 py-2 text-center text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                    />
                    <span className="text-sm text-muted">days</span>
                  </div>
                </div>
                {notifSettings.last_sent_at && (
                  <p className="text-xs text-subtle">
                    Last reminder sent {new Date(notifSettings.last_sent_at).toLocaleString()}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm lg:col-span-2">
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-warning-soft p-2 text-warning">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Local Browser Data</h2>
                <p className="text-sm text-muted">Data stored in this browser from before accounts existed</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {localCount === null ? (
              <p className="text-sm text-muted">Checking this browser for local data…</p>
            ) : localCount === 0 ? (
              <p className="text-sm text-muted">No local data found in this browser.</p>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning-soft/50 p-4">
                <div>
                  <p className="font-semibold text-text">
                    Found {localCount} record{localCount !== 1 ? 's' : ''} in this browser
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Import it into your account so it's saved to the server and available on any device.
                  </p>
                </div>
                <button
                  onClick={handleImportLocal}
                  disabled={migratingLocal}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {migratingLocal ? 'Importing…' : 'Import'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm lg:col-span-2">
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-info-soft p-2 text-info">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Privacy & Security</h2>
                <p className="text-sm text-muted">Your data lives on your account</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="rounded-xl bg-primary-soft/50 border border-primary/10 p-4">
              <p className="text-sm text-text leading-relaxed">
                MasterTrack stores your data on the server, scoped to your account. Only you can see it after
                signing in with your username/email and access code — nobody else's account can read it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="animate-scale-in rounded-xl bg-success-soft border border-success/20 px-5 py-4 text-sm font-medium text-success">
          {message}
        </div>
      )}
    </div>
  )
}
