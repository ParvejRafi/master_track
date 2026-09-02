import { useState, useMemo } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Mic,
  Search,
  MapPin,
  Calendar,
  Globe,
  Tag,
  Link2,
  X,
} from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import CountdownBadge from '../components/CountdownBadge'
import type { Conference } from '../types'
import { format, parseISO, differenceInDays, isPast } from 'date-fns'

const types: Conference['type'][] = [
  'Academic',
  'Industry',
  'Workshop',
  'Poster',
  'Keynote',
  'Virtual',
  'Other',
]

const statuses: Conference['status'][] = [
  'Researching',
  'Preparing',
  'Submitting',
  'Submitted',
  'Accepted',
  'Rejected',
  'Attending',
  'Withdrawn',
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  'Researching': { color: 'text-muted', bg: 'bg-surface-hover' },
  'Preparing': { color: 'text-primary', bg: 'bg-primary-soft' },
  'Submitting': { color: 'text-warning', bg: 'bg-warning-soft' },
  'Submitted': { color: 'text-info', bg: 'bg-info-soft' },
  'Accepted': { color: 'text-success', bg: 'bg-success-soft' },
  'Rejected': { color: 'text-danger', bg: 'bg-danger-soft' },
  'Attending': { color: 'text-primary', bg: 'bg-primary-soft' },
  'Withdrawn': { color: 'text-muted', bg: 'bg-surface-hover' },
}

const emptyConference: Omit<Conference, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  organizer: '',
  location: '',
  country: '',
  type: 'Academic',
  startDate: '',
  endDate: '',
  deadline: '',
  status: 'Researching',
  website: '',
  description: '',
  tags: '',
  notes: '',
}

export default function Conferences() {
  const conferences = useCollection('conferences')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Conference | null>(null)
  const [form, setForm] = useState(emptyConference)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Conference['status'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<Conference['type'] | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState('')

  const countries = useMemo(() => {
    const set = new Set(conferences.map((c) => c.country).filter(Boolean))
    return Array.from(set).sort()
  }, [conferences])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return conferences.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      if (countryFilter && c.country !== countryFilter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.organizer.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.tags.toLowerCase().includes(q)
      )
    })
  }, [conferences, search, statusFilter, typeFilter, countryFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyConference)
    setIsOpen(true)
  }

  const openEdit = (conference: Conference) => {
    setEditing(conference)
    setForm({
      name: conference.name,
      organizer: conference.organizer,
      location: conference.location,
      country: conference.country,
      type: conference.type,
      startDate: conference.startDate,
      endDate: conference.endDate,
      deadline: conference.deadline,
      status: conference.status,
      website: conference.website,
      description: conference.description,
      tags: conference.tags,
      notes: conference.notes,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (editing) {
      await apiDb.conferences.update(editing.id, { ...form, updatedAt: now })
    } else {
      await apiDb.conferences.add({
        ...form,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this conference?')) {
      await apiDb.conferences.delete(id)
    }
  }

  const getDeadlineLabel = (deadline: string) => {
    if (!deadline) return null
    const date = parseISO(deadline)
    const diff = differenceInDays(date, new Date())
    if (isPast(date)) return `Closed ${Math.abs(diff)}d ago`
    if (diff <= 7) return `Closes in ${diff}d`
    return `Closes in ${diff}d`
  }

  const getStatusColor = (status: string) => {
    return statusConfig[status] || { color: 'text-muted', bg: 'bg-surface-hover' }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setCountryFilter('')
  }

  const hasFilters = search || statusFilter !== 'all' || typeFilter !== 'all' || countryFilter

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Conferences</h1>
          <p className="mt-2 text-muted">
            {conferences.length === 0
              ? 'Track academic and industry conferences.'
              : `${conferences.length} conference${conferences.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Conference
        </button>
      </div>

      {conferences.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conferences..."
                className="w-full rounded-xl border border-border bg-page pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Conference['status'] | 'all')}
                className="rounded-xl border border-border bg-page px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as Conference['type'] | 'all')}
                className="rounded-xl border border-border bg-page px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {countries.length > 0 && (
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="rounded-xl border border-border bg-page px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">All Countries</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:bg-surface-hover hover:text-text active:scale-95"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {conferences.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-primary-soft p-4">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No conferences yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Start tracking conferences to manage deadlines, submissions, and travel plans.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Your First Conference
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <p className="text-sm text-muted">No conferences match your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const statusStyle = getStatusColor(c.status)
            const deadlineLabel = getDeadlineLabel(c.deadline)
            const tags = c.tags.split(',').map((t) => t.trim()).filter(Boolean)
            return (
              <div
                key={c.id}
                className={`group flex flex-col rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text truncate" title={c.name}>
                        {c.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5 truncate">{c.organizer}</p>
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold flex-shrink-0 ${statusStyle.bg} ${statusStyle.color}`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted line-clamp-2">{c.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-subtle" />
                      {c.location || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-subtle" />
                      {c.country || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mic className="h-3.5 w-3.5 text-subtle" />
                      {c.type}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {c.deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-subtle" />
                        <CountdownBadge date={c.deadline} prefix="Deadline" />
                      </span>
                    )}
                    {c.startDate && (
                      <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted">
                        {format(parseISO(c.startDate), 'MMM dd')}
                      </span>
                    )}
                    {c.endDate && (
                      <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted">
                        Ends {format(parseISO(c.endDate), 'MMM dd')}
                      </span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {deadlineLabel && (
                    <p className="mt-3 text-xs text-subtle">{deadlineLabel}</p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Visit
                    </a>
                  )}
                  <div className="flex gap-1 ml-auto">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Conference' : 'Add Conference'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-text">Conference Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. NeurIPS"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Organizer</label>
              <input
                value={form.organizer}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                placeholder="e.g. IEEE"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. New Orleans, USA"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. USA"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Conference['type'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Conference['status'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-text">Submission Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-text">Website</label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-text">Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. AI, NLP, workshop"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Conference details..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Personal notes..."
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
