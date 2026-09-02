import { useState } from 'react'
import { Plus, Pencil, Trash2, Briefcase, CheckSquare, Square, Sparkles } from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import CountdownBadge from '../components/CountdownBadge'
import { useDragToStatus } from '../hooks/useDragToStatus'
import type { Application, Task } from '../types'

const statuses: Application['status'][] = [
  'Researching',
  'Interested',
  'Eligibility Check',
  'Preparing',
  'Application Started',
  'Ready to Submit',
  'Submitted',
  'Under Review',
  'Interview',
  'Accepted',
  'Rejected',
  'Waitlisted',
  'Withdrawn',
]

const priorities: Application['priority'][] = ['Dream', 'Target', 'Safe', 'Backup']
const fundings: Application['funding'][] = ['Fully Funded', 'Partial', 'Self-Funded', 'Unknown']

const emptyApplication: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> = {
  programId: '',
  universityId: '',
  opensDate: '',
  status: 'Researching',
  priority: 'Target',
  deadline: '',
  funding: 'Unknown',
  progress: 0,
  notes: '',
}

const CHECKLIST_TEMPLATE = [
  'Statement of Purpose',
  'Official Transcripts',
  'Recommendation Letters',
  'English Test Scores (IELTS/TOEFL)',
  'CV / Resume',
  'Passport Copy',
  'Application Fee Payment',
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  'Researching': { color: 'text-muted', bg: 'bg-surface-hover' },
  'Interested': { color: 'text-info', bg: 'bg-info-soft' },
  'Eligibility Check': { color: 'text-warning', bg: 'bg-warning-soft' },
  'Preparing': { color: 'text-primary', bg: 'bg-primary-soft' },
  'Application Started': { color: 'text-primary', bg: 'bg-primary-soft' },
  'Ready to Submit': { color: 'text-info', bg: 'bg-info-soft' },
  'Submitted': { color: 'text-info', bg: 'bg-info-soft' },
  'Under Review': { color: 'text-warning', bg: 'bg-warning-soft' },
  'Interview': { color: 'text-primary', bg: 'bg-primary-soft' },
  'Accepted': { color: 'text-success', bg: 'bg-success-soft' },
  'Rejected': { color: 'text-danger', bg: 'bg-danger-soft' },
  'Waitlisted': { color: 'text-warning', bg: 'bg-warning-soft' },
  'Withdrawn': { color: 'text-muted', bg: 'bg-surface-hover' },
}

export default function Applications() {
  const universities = useCollection('universities')
  const programs = useCollection('programs')
  const applications = useCollection('applications')
  const tasks = useCollection('tasks')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Application | null>(null)
  const [form, setForm] = useState(emptyApplication)
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [applyingTemplate, setApplyingTemplate] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyApplication, universityId: universities[0]?.id || '', programId: programs[0]?.id || '' })
    setNewChecklistItem('')
    setIsOpen(true)
  }

  const openEdit = (app: Application) => {
    setEditing(app)
    setForm({
      programId: app.programId,
      universityId: app.universityId,
      opensDate: app.opensDate || '',
      status: app.status,
      priority: app.priority,
      deadline: app.deadline,
      funding: app.funding,
      progress: app.progress,
      notes: app.notes,
    })
    setNewChecklistItem('')
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (editing) {
      const linked = tasks.filter((t) => t.applicationId === editing.id)
      const progress =
        linked.length > 0
          ? Math.round((linked.filter((t) => t.status === 'done').length / linked.length) * 100)
          : form.progress
      await apiDb.applications.update(editing.id, { ...form, progress, updatedAt: now })
    } else {
      const created = await apiDb.applications.add({
        ...form,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
      // Stay open in edit mode so the checklist (and template) is immediately available.
      openEdit(created)
      return
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      await apiDb.applications.delete(id)
    }
  }

  const getUniversityName = (id: string) => universities.find((u) => u.id === id)?.name || 'Unknown'
  const getProgramName = (id: string) => programs.find((p) => p.id === id)?.name || 'Unknown'

  const getChecklistStats = (appId: string) => {
    const items = tasks.filter((t) => t.applicationId === appId)
    const done = items.filter((t) => t.status === 'done').length
    return { items, done, total: items.length }
  }

  const addChecklistItem = async () => {
    if (!editing || !newChecklistItem.trim()) return
    await apiDb.tasks.add({
      id: crypto.randomUUID(),
      title: newChecklistItem.trim(),
      description: '',
      applicationId: editing.id,
      universityId: editing.universityId,
      priority: 'medium',
      dueDate: '',
      status: 'todo',
      category: 'Application',
      createdAt: new Date().toISOString(),
    })
    setNewChecklistItem('')
  }

  const applyChecklistTemplate = async () => {
    if (!editing) return
    setApplyingTemplate(true)
    try {
      const existingTitles = new Set(
        tasks.filter((t) => t.applicationId === editing.id).map((t) => t.title.trim().toLowerCase())
      )
      const toAdd = CHECKLIST_TEMPLATE.filter((title) => !existingTitles.has(title.toLowerCase()))
      for (const title of toAdd) {
        await apiDb.tasks.add({
          id: crypto.randomUUID(),
          title,
          description: '',
          applicationId: editing.id,
          universityId: editing.universityId,
          priority: 'medium',
          dueDate: '',
          status: 'todo',
          category: 'Application',
          createdAt: new Date().toISOString(),
        })
      }
    } finally {
      setApplyingTemplate(false)
    }
  }

  const toggleChecklistItem = async (task: Task) => {
    await apiDb.tasks.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
  }

  const removeChecklistItem = async (id: string) => {
    await apiDb.tasks.delete(id)
  }

  const grouped = statuses.reduce<Record<string, Application[]>>((acc, status) => {
    acc[status] = applications.filter((a) => a.status === status)
    return acc
  }, {})

  const { draggingId, overStatus, dragProps, columnProps } = useDragToStatus((id, status) =>
    apiDb.applications.update(id, { status: status as Application['status'] })
  )

  const editingChecklist = editing ? getChecklistStats(editing.id) : null
  const editingChecklistPct =
    editingChecklist && editingChecklist.total > 0
      ? Math.round((editingChecklist.done / editingChecklist.total) * 100)
      : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Applications</h1>
          <p className="mt-2 text-muted">
            {applications.length === 0
              ? 'Track your applications through the pipeline.'
              : `${applications.length} application${applications.length !== 1 ? 's' : ''} in progress`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-primary-soft p-4">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No applications yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Start tracking your master's applications by adding them here.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Your First Application
          </button>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => {
            const items = grouped[status] || []
            return (
              <div
                key={status}
                {...columnProps(status)}
                className={`min-w-[280px] flex-1 rounded-2xl border shadow-sm transition-colors ${
                  overStatus === status ? 'border-primary bg-primary-soft/30' : 'border-border bg-surface'
                }`}
              >
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text">{status}</h3>
                    <span className="rounded-lg bg-surface-hover px-2 py-0.5 text-xs font-semibold text-muted">
                      {items.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3 min-h-[60px]">
                  {items.length === 0 && (
                    <p className="py-4 text-center text-xs text-subtle">Drop here</p>
                  )}
                  {items.map((app) => {
                    const checklist = getChecklistStats(app.id)
                    const pct = checklist.total > 0 ? Math.round((checklist.done / checklist.total) * 100) : app.progress
                    return (
                    <div
                      key={app.id}
                      {...dragProps(app.id)}
                      className={`group relative cursor-grab rounded-xl border border-border bg-page p-3 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md active:cursor-grabbing ${
                        draggingId === app.id ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text truncate">
                            {getUniversityName(app.universityId)}
                          </p>
                          <p className="text-xs text-muted truncate mt-0.5">{getProgramName(app.programId)}</p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${statusConfig[app.status]?.bg || 'bg-surface-hover'} ${statusConfig[app.status]?.color || 'text-muted'}`}>
                              {app.priority}
                            </span>
                            <span className="rounded-lg bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted">
                              {app.funding}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {app.opensDate && new Date(app.opensDate) > new Date() && (
                              <CountdownBadge date={app.opensDate} prefix="Opens in" />
                            )}
                            {app.deadline && <CountdownBadge date={app.deadline} prefix="Due in" />}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(app)}
                            className="rounded-lg p-1 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="rounded-lg p-1 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-muted font-medium">
                          {checklist.total > 0
                            ? `${checklist.done}/${checklist.total} checklist items · ${pct}%`
                            : `${pct}% complete`}
                        </p>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Application' : 'Add Application'} size="lg">
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
              <label className="block text-sm font-semibold text-text">Program</label>
              <select
                required
                value={form.programId}
                onChange={(e) => setForm({ ...form, programId: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Select program</option>
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
              <label className="block text-sm font-semibold text-text">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Application['status'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
              <label className="block text-sm font-semibold text-text">Funding</label>
              <select
                value={form.funding}
                onChange={(e) => setForm({ ...form, funding: e.target.value as Application['funding'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {fundings.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label className="block text-sm font-semibold text-text">Checklist</label>
              {editingChecklist && (
                <span className="text-xs font-medium text-muted">
                  {editingChecklist.total > 0
                    ? `${editingChecklist.done}/${editingChecklist.total} done · ${editingChecklistPct}%`
                    : 'Progress is calculated automatically'}
                </span>
              )}
            </div>

            {!editingChecklist ? (
              <p className="mt-2 text-xs text-subtle italic">
                Create the application first — the checklist (with a one-click standard template) appears right after.
              </p>
            ) : (
              <>
                <div className="mt-2 h-2 w-full rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-300"
                    style={{ width: `${editingChecklistPct}%` }}
                  />
                </div>

                {editingChecklist.items.length > 0 && (
                  <button
                    type="button"
                    onClick={applyChecklistTemplate}
                    disabled={applyingTemplate}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {applyingTemplate ? 'Adding…' : 'Add missing standard items'}
                  </button>
                )}

                <div className="mt-3 space-y-1.5">
                  {editingChecklist.items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center">
                      <p className="text-xs text-subtle">No checklist items yet.</p>
                      <button
                        type="button"
                        onClick={applyChecklistTemplate}
                        disabled={applyingTemplate}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {applyingTemplate ? 'Adding…' : 'Apply Standard Checklist'}
                      </button>
                    </div>
                  ) : (
                    editingChecklist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-page px-3 py-2"
                      >
                        <button
                          type="button"
                          onClick={() => toggleChecklistItem(item)}
                          className="flex-shrink-0 text-primary"
                        >
                          {item.status === 'done' ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4 text-muted" />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm ${item.status === 'done' ? 'text-muted line-through' : 'text-text'}`}
                        >
                          {item.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(item.id)}
                          className="flex-shrink-0 text-muted transition-colors hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-2 flex gap-2">
                  <input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addChecklistItem()
                      }
                    }}
                    placeholder="e.g. Submit SOP"
                    className="flex-1 rounded-xl border border-border bg-page px-4 py-2 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text transition-all duration-200 hover:bg-surface-hover active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Application notes..."
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
