import { useState } from 'react'
import { Download, Moon, Sun, Shield, HardDrive } from 'lucide-react'
import db from '../db/schema'

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )
  const [message, setMessage] = useState('')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await (db as any).export()
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
        if (confirm('This will replace all current data. Are you sure?')) {
          await (db as any).clear()
          await (db as any).import(data)
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
              <div className="rounded-xl bg-info-soft p-2 text-info">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Privacy & Security</h2>
                <p className="text-sm text-muted">Your data stays on your device</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="rounded-xl bg-primary-soft/50 border border-primary/10 p-4">
              <p className="text-sm text-text leading-relaxed">
                MasterTrack stores all data locally in your browser using IndexedDB. No data is sent to any server.
                Your research, applications, and personal information remain completely private and under your control.
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
