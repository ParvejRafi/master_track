import { useState } from 'react'
import { Plus, Pencil, Trash2, GraduationCap, Building2, ExternalLink } from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import type { Program } from '../types'

const emptyProgram: Omit<Program, 'id' | 'createdAt' | 'updatedAt'> = {
  universityId: '',
  name: '',
  degree: "Master's",
  specialization: '',
  duration: '',
  language: 'English',
  website: '',
  description: '',
  notes: '',
}

export default function Programs() {
  const universities = useCollection('universities')
  const programs = useCollection('programs')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState(emptyProgram)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyProgram, universityId: universities[0]?.id || '' })
    setIsOpen(true)
  }

  const openEdit = (prog: Program) => {
    setEditing(prog)
    setForm({
      universityId: prog.universityId,
      name: prog.name,
      degree: prog.degree,
      specialization: prog.specialization,
      duration: prog.duration,
      language: prog.language,
      website: prog.website,
      description: prog.description,
      notes: prog.notes,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (editing) {
      await apiDb.programs.update(editing.id, { ...form, updatedAt: now })
    } else {
      await apiDb.programs.add({
        ...form,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      await apiDb.programs.delete(id)
    }
  }

  const getUniversityName = (id: string) => {
    return universities.find((u) => u.id === id)?.name || 'Unknown'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Programs</h1>
          <p className="mt-2 text-muted">
            {programs.length === 0
              ? 'Add programs to start tracking.'
              : `${programs.length} program${programs.length !== 1 ? 's' : ''} across ${universities.length} universities`}
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={universities.length === 0}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add Program
        </button>
      </div>

      {universities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-warning-soft p-4">
            <Building2 className="h-8 w-8 text-warning" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">Add a university first</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Programs are linked to universities. Add a university to get started.
          </p>
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-primary-soft p-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No programs yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Start by adding programs from your target universities.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Your First Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((prog, i) => (
            <div
              key={prog.id}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text truncate">{prog.name}</h3>
                  <p className="mt-1 text-sm text-muted truncate">{getUniversityName(prog.universityId)}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(prog)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prog.id)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted">
                <span className="rounded-lg bg-surface-hover px-2.5 py-1 font-medium">{prog.degree}</span>
                {prog.specialization && (
                  <span className="truncate">{prog.specialization}</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-subtle">
                {prog.duration && <span>{prog.duration}</span>}
                {prog.language && <span>{prog.language}</span>}
              </div>
              {prog.website && (
                <a
                  href={prog.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Program Website
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Program' : 'Add Program'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text">University</label>
            <select
              required
              value={form.universityId}
              onChange={(e) => setForm({ ...form, universityId: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Select university</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Program Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. MSc Computer Science"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Degree</label>
              <input
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Specialization</label>
              <input
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="e.g. AI"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 2 years"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Language</label>
              <input
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Program overview..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Your notes..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
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
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
