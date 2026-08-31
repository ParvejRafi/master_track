import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Mail,
  Link as LinkIcon,
  FlaskConical,
  BookOpen,
  X,
} from 'lucide-react'
import db from '../db/schema'
import Modal from '../components/Modal'
import type { Professor, ResearchPaper } from '../types'

const contactStatuses: Professor['contactStatus'][] = [
  'Not Contacted',
  'Researching',
  'Drafting Email',
  'Emailed',
  'Replied',
  'No Response',
  'Meeting Scheduled',
  'Not Pursuing',
]

const priorities: Professor['priority'][] = ['High', 'Medium', 'Low']

const statusConfig: Record<string, { color: string; bg: string }> = {
  'Not Contacted': { color: 'text-muted', bg: 'bg-surface-hover' },
  'Researching': { color: 'text-info', bg: 'bg-info-soft' },
  'Drafting Email': { color: 'text-warning', bg: 'bg-warning-soft' },
  'Emailed': { color: 'text-primary', bg: 'bg-primary-soft' },
  'Replied': { color: 'text-success', bg: 'bg-success-soft' },
  'No Response': { color: 'text-danger', bg: 'bg-danger-soft' },
  'Meeting Scheduled': { color: 'text-success', bg: 'bg-success-soft' },
  'Not Pursuing': { color: 'text-muted', bg: 'bg-surface-hover' },
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
  High: { color: 'text-danger', bg: 'bg-danger-soft' },
  Medium: { color: 'text-warning', bg: 'bg-warning-soft' },
  Low: { color: 'text-muted', bg: 'bg-surface-hover' },
}

const emptyPaper: ResearchPaper = { title: '', link: '', year: '', notes: '' }

const emptyProfessor: Omit<Professor, 'id' | 'createdAt' | 'updatedAt'> = {
  universityId: '',
  programId: '',
  name: '',
  title: '',
  department: '',
  email: '',
  profileUrl: '',
  labName: '',
  labUrl: '',
  researchAreas: '',
  papers: [],
  fitNotes: '',
  contactStatus: 'Not Contacted',
  priority: 'Medium',
  lastContactedDate: '',
}

export default function Professors() {
  const universities = useLiveQuery(() => db.universities.toArray()) || []
  const programs = useLiveQuery(() => db.programs.toArray()) || []
  const professors = useLiveQuery(() => db.professors.toArray()) || []

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Professor | null>(null)
  const [form, setForm] = useState(emptyProfessor)
  const [universityFilter, setUniversityFilter] = useState('')

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyProfessor, universityId: universityFilter || universities[0]?.id || '' })
    setIsOpen(true)
  }

  const openEdit = (prof: Professor) => {
    setEditing(prof)
    setForm({
      universityId: prof.universityId,
      programId: prof.programId || '',
      name: prof.name,
      title: prof.title,
      department: prof.department,
      email: prof.email,
      profileUrl: prof.profileUrl,
      labName: prof.labName,
      labUrl: prof.labUrl,
      researchAreas: prof.researchAreas,
      papers: prof.papers || [],
      fitNotes: prof.fitNotes,
      contactStatus: prof.contactStatus,
      priority: prof.priority,
      lastContactedDate: prof.lastContactedDate || '',
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const cleanPapers = form.papers.filter((p) => p.title.trim() !== '')
    if (editing) {
      await db.professors.update(editing.id, { ...form, papers: cleanPapers, updatedAt: now })
    } else {
      await db.professors.add({
        ...form,
        papers: cleanPapers,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this professor?')) {
      await db.professors.delete(id)
    }
  }

  const addPaperRow = () => setForm({ ...form, papers: [...form.papers, { ...emptyPaper }] })
  const updatePaperRow = (idx: number, patch: Partial<ResearchPaper>) => {
    const papers = form.papers.map((p, i) => (i === idx ? { ...p, ...patch } : p))
    setForm({ ...form, papers })
  }
  const removePaperRow = (idx: number) => setForm({ ...form, papers: form.papers.filter((_, i) => i !== idx) })

  const getUniversityName = (id: string) => universities.find((u) => u.id === id)?.name || 'Unknown'
  const getProgramName = (id?: string) => (id && programs.find((p) => p.id === id)?.name) || ''

  const filtered = universityFilter
    ? professors.filter((p) => p.universityId === universityFilter)
    : professors

  const grouped = contactStatuses.reduce<Record<string, Professor[]>>((acc, status) => {
    acc[status] = filtered.filter((p) => p.contactStatus === status)
    return acc
  }, {})

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Professors</h1>
          <p className="mt-2 text-muted">
            {professors.length === 0
              ? 'Track potential supervisors, their research and your outreach.'
              : `${professors.length} contact${professors.length !== 1 ? 's' : ''} across your target universities`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
            className="rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">All universities</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Professor
          </button>
        </div>
      </div>

      {professors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-primary-soft p-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No professors yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Add professors whose research fits your interests. Track their papers, lab, and your outreach status.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Your First Professor
          </button>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {contactStatuses.map((status) => {
            const items = grouped[status] || []
            if (items.length === 0 && !['Not Contacted', 'Researching', 'Emailed'].includes(status)) return null
            return (
              <div
                key={status}
                className="min-w-[300px] flex-1 rounded-2xl border border-border bg-surface shadow-sm"
              >
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${statusConfig[status]?.color || 'text-text'}`}>{status}</h3>
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${statusConfig[status]?.bg || 'bg-surface-hover'} ${statusConfig[status]?.color || 'text-muted'}`}>
                      {items.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {items.map((prof) => (
                    <div
                      key={prof.id}
                      className="group relative rounded-xl border border-border bg-page p-3 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text truncate">{prof.name}</p>
                          <p className="text-xs text-muted truncate mt-0.5">
                            {[prof.title, prof.department].filter(Boolean).join(' · ') || 'No title set'}
                          </p>
                          <p className="text-xs text-subtle truncate mt-0.5">
                            {getUniversityName(prof.universityId)}
                            {getProgramName(prof.programId) ? ` · ${getProgramName(prof.programId)}` : ''}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(prof)}
                            className="rounded-lg p-1 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(prof.id)}
                            className="rounded-lg p-1 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {prof.researchAreas && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prof.researchAreas.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-md bg-info-soft px-1.5 py-0.5 text-[10px] font-medium text-info">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${priorityConfig[prof.priority]?.bg} ${priorityConfig[prof.priority]?.color}`}>
                          {prof.priority}
                        </span>
                        {prof.papers?.length > 0 && (
                          <span className="flex items-center gap-1 rounded-lg bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted">
                            <BookOpen className="h-3 w-3" />
                            {prof.papers.length} paper{prof.papers.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {prof.fitNotes && (
                        <p className="mt-2 text-xs text-muted line-clamp-2">{prof.fitNotes}</p>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        {prof.email && (
                          <a
                            href={`mailto:${prof.email}`}
                            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-text transition-colors hover:bg-primary-soft hover:text-primary hover:border-primary/30"
                            title={prof.email}
                          >
                            <Mail className="h-3 w-3" />
                            Email
                          </a>
                        )}
                        {prof.labUrl && (
                          <a
                            href={prof.labUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-text transition-colors hover:bg-surface-hover"
                          >
                            <FlaskConical className="h-3 w-3" />
                            Lab
                          </a>
                        )}
                        {prof.profileUrl && (
                          <a
                            href={prof.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-text transition-colors hover:bg-surface-hover"
                          >
                            <LinkIcon className="h-3 w-3" />
                            Profile
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Professor' : 'Add Professor'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">University</label>
              <select
                required
                value={form.universityId}
                onChange={(e) => setForm({ ...form, universityId: e.target.value, programId: '' })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Select university</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Program (optional)</label>
              <select
                value={form.programId}
                onChange={(e) => setForm({ ...form, programId: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">None</option>
                {programs
                  .filter((p) => p.universityId === form.universityId || !form.universityId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dr. Jane Smith"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Associate Professor"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Computer Science"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane.smith@university.edu"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Profile URL</label>
              <input
                value={form.profileUrl}
                onChange={(e) => setForm({ ...form, profileUrl: e.target.value })}
                placeholder="https://university.edu/~jsmith"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Research Areas</label>
              <input
                value={form.researchAreas}
                onChange={(e) => setForm({ ...form, researchAreas: e.target.value })}
                placeholder="NLP, ML fairness, robotics"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="mt-1 text-xs text-subtle">Comma-separated</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Lab / Research Center</label>
              <input
                value={form.labName}
                onChange={(e) => setForm({ ...form, labName: e.target.value })}
                placeholder="AI Robotics Lab"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Lab URL</label>
              <input
                value={form.labUrl}
                onChange={(e) => setForm({ ...form, labUrl: e.target.value })}
                placeholder="https://ailab.university.edu"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Contact Status</label>
              <select
                value={form.contactStatus}
                onChange={(e) => setForm({ ...form, contactStatus: e.target.value as Professor['contactStatus'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {contactStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Professor['priority'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Last Contacted</label>
              <input
                type="date"
                value={form.lastContactedDate}
                onChange={(e) => setForm({ ...form, lastContactedDate: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-text">Relevant Papers</label>
              <button
                type="button"
                onClick={addPaperRow}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Paper
              </button>
            </div>
            {form.papers.length === 0 ? (
              <p className="mt-2 text-xs text-subtle">No papers added yet. Note down work of theirs that's relevant to your interests.</p>
            ) : (
              <div className="mt-2 space-y-3">
                {form.papers.map((paper, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-page p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <input
                        value={paper.title}
                        onChange={(e) => updatePaperRow(idx, { title: e.target.value })}
                        placeholder="Paper title"
                        className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <input
                        value={paper.year}
                        onChange={(e) => updatePaperRow(idx, { year: e.target.value })}
                        placeholder="Year"
                        className="w-20 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removePaperRow(idx)}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      value={paper.link}
                      onChange={(e) => updatePaperRow(idx, { link: e.target.value })}
                      placeholder="Link (DOI, arXiv, PDF...)"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <textarea
                      value={paper.notes}
                      onChange={(e) => updatePaperRow(idx, { notes: e.target.value })}
                      placeholder="Why it's relevant to your interests..."
                      rows={2}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text">Fit Notes</label>
            <textarea
              value={form.fitNotes}
              onChange={(e) => setForm({ ...form, fitNotes: e.target.value })}
              rows={3}
              placeholder="Why this professor is a good fit for your research interests..."
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
