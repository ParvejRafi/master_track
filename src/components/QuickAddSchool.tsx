import { useState } from 'react'
import { Zap } from 'lucide-react'
import Modal from './Modal'
import apiDb from '../lib/apiDb'
import type { Application } from '../types'

const priorities: Application['priority'][] = ['Dream', 'Target', 'Safe', 'Backup']

const emptyForm = {
  universityName: '',
  country: '',
  city: '',
  programName: '',
  degree: "Master's",
  opensDate: '',
  deadline: '',
  priority: 'Target' as Application['priority'],
}

export default function QuickAddSchool({
  onDone,
  variant = 'primary',
}: {
  onDone?: () => void
  variant?: 'primary' | 'outline'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const open = () => {
    setForm(emptyForm)
    setError('')
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const now = new Date().toISOString()
    try {
      const university = await apiDb.universities.add({
        id: crypto.randomUUID(),
        name: form.universityName.trim(),
        country: form.country.trim(),
        city: form.city.trim(),
        type: 'Public',
        website: '',
        description: '',
        notes: '',
        createdAt: now,
        updatedAt: now,
      })
      const program = await apiDb.programs.add({
        id: crypto.randomUUID(),
        universityId: university.id,
        name: form.programName.trim(),
        degree: form.degree.trim(),
        specialization: '',
        duration: '',
        language: '',
        website: '',
        description: '',
        notes: '',
        createdAt: now,
        updatedAt: now,
      })
      await apiDb.applications.add({
        id: crypto.randomUUID(),
        universityId: university.id,
        programId: program.id,
        opensDate: form.opensDate,
        status: 'Researching',
        priority: form.priority,
        deadline: form.deadline,
        funding: 'Unknown',
        progress: 0,
        notes: '',
        createdAt: now,
        updatedAt: now,
      })
      setIsOpen(false)
      onDone?.()
    } catch {
      setError('Something went wrong partway through. Check Universities/Programs/Applications for a partial entry before retrying.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={open}
        className={
          variant === 'primary'
            ? 'flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95'
            : 'flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text transition-all duration-200 hover:bg-surface-hover active:scale-95'
        }
      >
        <Zap className="h-4 w-4" />
        Quick Add School
      </button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Quick Add School">
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-muted -mt-1">
            Creates the university, a program, and an application in one go. You can fill in the rest of the details later.
          </p>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text">University Name</label>
            <input
              required
              value={form.universityName}
              onChange={(e) => setForm({ ...form, universityName: e.target.value })}
              placeholder="e.g. Qatar University"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Qatar"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Doha"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Program Name</label>
              <input
                required
                value={form.programName}
                onChange={(e) => setForm({ ...form, programName: e.target.value })}
                placeholder="e.g. MSc Computer Science"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Degree</label>
              <input
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Opens Date</label>
              <input
                type="date"
                value={form.opensDate}
                onChange={(e) => setForm({ ...form, opensDate: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Application['priority'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text transition-all duration-200 hover:bg-surface-hover active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
