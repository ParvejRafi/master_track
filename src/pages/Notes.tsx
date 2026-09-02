import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, StickyNote, Search, Building2, Briefcase } from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import type { Note } from '../types'

const categories: Note['category'][] = [
  'Admission',
  'Scholarship',
  'Funding',
  'Faculty',
  'Research',
  'Application',
  'Visa',
  'Personal',
  'Other',
]

const categoryConfig: Record<string, { color: string; bg: string }> = {
  Admission: { color: 'text-primary', bg: 'bg-primary-soft' },
  Scholarship: { color: 'text-success', bg: 'bg-success-soft' },
  Funding: { color: 'text-success', bg: 'bg-success-soft' },
  Faculty: { color: 'text-info', bg: 'bg-info-soft' },
  Research: { color: 'text-info', bg: 'bg-info-soft' },
  Application: { color: 'text-warning', bg: 'bg-warning-soft' },
  Visa: { color: 'text-danger', bg: 'bg-danger-soft' },
  Personal: { color: 'text-muted', bg: 'bg-surface-hover' },
  Other: { color: 'text-muted', bg: 'bg-surface-hover' },
}

const emptyNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  content: '',
  category: 'Other',
  universityId: undefined,
  programId: undefined,
  applicationId: undefined,
}

export default function Notes() {
  const notes = useCollection('notes')
  const universities = useCollection('universities')
  const programs = useCollection('programs')
  const applications = useCollection('applications')

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [form, setForm] = useState(emptyNote)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Note['category'] | 'all'>('all')

  const getUniversityName = (id?: string) => (id && universities.find((u) => u.id === id)?.name) || ''
  const getProgramName = (id?: string) => (id && programs.find((p) => p.id === id)?.name) || ''
  const getApplicationLabel = (id?: string) => {
    const app = applications.find((a) => a.id === id)
    if (!app) return ''
    const uni = getUniversityName(app.universityId)
    const prog = getProgramName(app.programId)
    return [uni, prog].filter(Boolean).join(' · ')
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return notes
      .filter((n) => categoryFilter === 'all' || n.category === categoryFilter)
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  }, [notes, search, categoryFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyNote)
    setIsOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditing(note)
    setForm({
      title: note.title,
      content: note.content,
      category: note.category,
      universityId: note.universityId || undefined,
      programId: note.programId || undefined,
      applicationId: note.applicationId || undefined,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const cleanForm = {
      ...form,
      universityId: form.universityId || undefined,
      programId: form.programId || undefined,
      applicationId: form.applicationId || undefined,
    }
    if (editing) {
      await apiDb.notes.update(editing.id, { ...cleanForm, updatedAt: now })
    } else {
      await apiDb.notes.add({
        ...cleanForm,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this note?')) {
      await apiDb.notes.delete(id)
    }
  }

  const applicationsForUniversity = form.universityId
    ? applications.filter((a) => a.universityId === form.universityId)
    : applications

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Notes</h1>
          <p className="mt-2 text-muted">
            {notes.length === 0
              ? 'Jot down context on universities, applications, or anything else.'
              : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      </div>

      {notes.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-xl border border-border bg-page py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Note['category'] | 'all')}
            className="rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 animate-fade-in">
          <div className="rounded-full bg-primary-soft p-4">
            <StickyNote className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">
            {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            {notes.length === 0
              ? 'Capture context that does not fit anywhere else — a conversation with a professor, funding details, visa reminders.'
              : 'Try a different search or category.'}
          </p>
          {notes.length === 0 && (
            <button
              onClick={openCreate}
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note, i) => (
            <div
              key={note.id}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${categoryConfig[note.category]?.bg} ${categoryConfig[note.category]?.color}`}>
                    {note.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-text truncate">{note.title}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(note)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {note.content || 'No content'}
              </p>
              {(note.universityId || note.applicationId) && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                  {note.applicationId ? (
                    <span className="flex items-center gap-1 rounded-lg bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted">
                      <Briefcase className="h-3 w-3" />
                      {getApplicationLabel(note.applicationId) || 'Linked application'}
                    </span>
                  ) : note.universityId ? (
                    <span className="flex items-center gap-1 rounded-lg bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted">
                      <Building2 className="h-3 w-3" />
                      {getUniversityName(note.universityId)}
                      {note.programId ? ` · ${getProgramName(note.programId)}` : ''}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Note' : 'Add Note'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Call with Prof. Smith"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              placeholder="What do you want to remember?"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Note['category'] })}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-border p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Link to (optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text">University</label>
                <select
                  value={form.universityId || ''}
                  onChange={(e) => setForm({ ...form, universityId: e.target.value || undefined, programId: undefined, applicationId: undefined })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">None</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text">Program</label>
                <select
                  value={form.programId || ''}
                  onChange={(e) => setForm({ ...form, programId: e.target.value || undefined })}
                  disabled={!form.universityId}
                  className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                >
                  <option value="">None</option>
                  {programs
                    .filter((p) => p.universityId === form.universityId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Application</label>
              <select
                value={form.applicationId || ''}
                onChange={(e) => setForm({ ...form, applicationId: e.target.value || undefined })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">None</option>
                {applicationsForUniversity.map((a) => (
                  <option key={a.id} value={a.id}>
                    {getUniversityName(a.universityId)} · {getProgramName(a.programId)}
                  </option>
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
