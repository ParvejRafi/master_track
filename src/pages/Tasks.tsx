import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckSquare, Play, XCircle } from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import type { Task } from '../types'
import { format, parseISO, isPast, isToday } from 'date-fns'

const categories: Task['category'][] = [
  'Research',
  'Documents',
  'SOP',
  'Recommendation',
  'Application',
  'Scholarship',
  'Visa',
  'Other',
]

const emptyTask: Omit<Task, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  applicationId: undefined,
  universityId: undefined,
  priority: 'medium',
  dueDate: '',
  status: 'todo',
  category: 'Research',
}

export default function Tasks() {
  const tasks = useCollection('tasks')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState(emptyTask)
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all')

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyTask)
    setIsOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description,
      applicationId: task.applicationId,
      universityId: task.universityId,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
      category: task.category,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await apiDb.tasks.update(editing.id, form)
    } else {
      await apiDb.tasks.add({
        ...form,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await apiDb.tasks.delete(id)
    }
  }

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo'
    await apiDb.tasks.update(task.id, { status: next })
  }

  const getDueStatus = (dateStr: string) => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    if (isPast(date) && !isToday(date)) return 'overdue'
    if (isToday(date)) return 'today'
    return 'upcoming'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Tasks</h1>
          <p className="mt-2 text-muted">
            {tasks.length === 0
              ? 'Create tasks to manage your application workflow.'
              : `${tasks.filter(t => t.status !== 'done').length} of ${tasks.length} tasks remaining`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'todo', 'in_progress', 'done'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all duration-200 ${
              filter === s
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-muted hover:bg-surface-hover hover:text-text border border-border'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-primary-soft p-4">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No tasks found</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            {filter === 'all' ? 'Create your first task to get started.' : `No ${filter.replace('_', ' ')} tasks.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={openCreate}
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task, i) => {
            const due = getDueStatus(task.dueDate)
            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)} ${
                  task.status === 'done' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => toggleStatus(task)}
                    className={`mt-0.5 rounded-xl border-2 p-2 transition-all duration-200 hover:scale-110 ${
                      task.status === 'done'
                        ? 'border-success bg-success-soft text-success'
                        : task.status === 'in_progress'
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border hover:border-primary hover:bg-primary-soft'
                    }`}
                    title={task.status === 'done' ? 'Mark as todo' : task.status === 'in_progress' ? 'Mark as todo' : 'Mark as done'}
                  >
                    <CheckSquare className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-text ${task.status === 'done' ? 'line-through text-muted' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-1 text-sm text-muted line-clamp-1">{task.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-semibold text-muted">
                        {task.category}
                      </span>
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        task.priority === 'high' ? 'bg-danger-soft text-danger' :
                        task.priority === 'medium' ? 'bg-warning-soft text-warning' :
                        'bg-surface-hover text-muted'
                      }`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          due === 'overdue' ? 'bg-danger-soft text-danger' :
                          due === 'today' ? 'bg-warning-soft text-warning' :
                          'bg-surface-hover text-muted'
                        }`}>
                          {format(parseISO(task.dueDate), 'MMM dd, yyyy')}
                          {due === 'overdue' && ' • Overdue'}
                          {due === 'today' && ' • Today'}
                        </span>
                      )}
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${
                        task.status === 'done' ? 'bg-success-soft text-success' :
                        task.status === 'in_progress' ? 'bg-primary-soft text-primary' :
                        'bg-surface-hover text-muted'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2">
                  {task.status === 'todo' && (
                    <button
                      onClick={() => apiDb.tasks.update(task.id, { status: 'in_progress' })}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                      title="Start task"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => apiDb.tasks.update(task.id, { status: 'todo' })}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                      title="Pause task"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  {task.status !== 'done' && (
                    <button
                      onClick={() => apiDb.tasks.update(task.id, { status: 'done' })}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-success-soft hover:text-success"
                      title="Mark as done"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </button>
                  )}
                  {task.status === 'done' && (
                    <button
                      onClick={() => apiDb.tasks.update(task.id, { status: 'in_progress' })}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                      title="Reopen task"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(task)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Request recommendation letter"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Task details..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Task['category'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
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
