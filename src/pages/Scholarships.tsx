import { useState, useMemo } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Award,
  Search,
  Globe,
  Calendar,
  DollarSign,
  Tag,
  Link2,
  X,
} from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import CountdownBadge from '../components/CountdownBadge'
import type { Scholarship } from '../types'
import { format, parseISO, differenceInDays, isPast } from 'date-fns'

const levels: Scholarship['level'][] = ['Bachelor', 'Master', 'PhD', 'Any']

const statuses: Scholarship['status'][] = [
  'Researching',
  'Preparing',
  'Applying',
  'Submitted',
  'Awarded',
  'Rejected',
  'Withdrawn',
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  'Researching': { color: 'text-muted', bg: 'bg-surface-hover' },
  'Preparing': { color: 'text-primary', bg: 'bg-primary-soft' },
  'Applying': { color: 'text-warning', bg: 'bg-warning-soft' },
  'Submitted': { color: 'text-info', bg: 'bg-info-soft' },
  'Awarded': { color: 'text-success', bg: 'bg-success-soft' },
  'Rejected': { color: 'text-danger', bg: 'bg-danger-soft' },
  'Withdrawn': { color: 'text-muted', bg: 'bg-surface-hover' },
}

const emptyScholarship: Omit<Scholarship, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  provider: '',
  country: '',
  level: 'Master',
  amount: '',
  currency: 'USD',
  deadline: '',
  startDate: '',
  endDate: '',
  status: 'Researching',
  eligibility: '',
  requirements: '',
  description: '',
  tags: '',
  website: '',
  notes: '',
}

export default function Scholarships() {
  const scholarships = useCollection('scholarships')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Scholarship | null>(null)
  const [form, setForm] = useState(emptyScholarship)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Scholarship['status'] | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState<Scholarship['level'] | 'all'>('all')

  const countries = useMemo(() => {
    const set = new Set(scholarships.map((s) => s.country).filter(Boolean))
    return Array.from(set).sort()
  }, [scholarships])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return scholarships.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (levelFilter !== 'all' && s.level !== levelFilter) return false
      if (countryFilter && s.country !== countryFilter) return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q)
      )
    })
  }, [scholarships, search, statusFilter, countryFilter, levelFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyScholarship)
    setIsOpen(true)
  }

  const openEdit = (scholarship: Scholarship) => {
    setEditing(scholarship)
    setForm({
      name: scholarship.name,
      provider: scholarship.provider,
      country: scholarship.country,
      level: scholarship.level,
      amount: scholarship.amount,
      currency: scholarship.currency,
      deadline: scholarship.deadline,
      startDate: scholarship.startDate,
      endDate: scholarship.endDate,
      status: scholarship.status,
      eligibility: scholarship.eligibility,
      requirements: scholarship.requirements,
      description: scholarship.description,
      tags: scholarship.tags,
      website: scholarship.website,
      notes: scholarship.notes,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (editing) {
      await apiDb.scholarships.update(editing.id, { ...form, updatedAt: now })
    } else {
      await apiDb.scholarships.add({
        ...form,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this scholarship?')) {
      await apiDb.scholarships.delete(id)
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
    setCountryFilter('')
    setLevelFilter('all')
  }

  const hasFilters = search || statusFilter !== 'all' || countryFilter || levelFilter !== 'all'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Scholarships</h1>
          <p className="mt-2 text-muted">
            {scholarships.length === 0
              ? 'Track government and institutional scholarships.'
              : `${scholarships.length} scholarship${scholarships.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Scholarship
        </button>
      </div>

      {scholarships.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scholarships..."
                className="w-full rounded-xl border border-border bg-page pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Scholarship['status'] | 'all')}
                className="rounded-xl border border-border bg-page px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as Scholarship['level'] | 'all')}
                className="rounded-xl border border-border bg-page px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Levels</option>
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
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

      {scholarships.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-primary-soft p-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No scholarships yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Start tracking government and institutional scholarships to manage deadlines and requirements.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Your First Scholarship
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <p className="text-sm text-muted">No scholarships match your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s, i) => {
            const statusStyle = getStatusColor(s.status)
            const deadlineLabel = getDeadlineLabel(s.deadline)
            const tags = s.tags.split(',').map((t) => t.trim()).filter(Boolean)
            return (
              <div
                key={s.id}
                className={`group flex flex-col rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text truncate" title={s.name}>
                        {s.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5 truncate">{s.provider}</p>
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold flex-shrink-0 ${statusStyle.bg} ${statusStyle.color}`}>
                      {s.status}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted line-clamp-2">{s.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-subtle" />
                      {s.country || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-subtle" />
                      {s.level}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-text">
                      <DollarSign className="h-3.5 w-3.5 text-subtle" />
                      {s.amount ? `${s.amount} ${s.currency}` : 'Amount TBD'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {s.deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-subtle" />
                        <CountdownBadge date={s.deadline} prefix="Deadline" />
                      </span>
                    )}
                    {s.startDate && (
                      <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted">
                        Starts {format(parseISO(s.startDate), 'MMM dd')}
                      </span>
                    )}
                    {s.endDate && (
                      <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted">
                        Ends {format(parseISO(s.endDate), 'MMM dd')}
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
                  {s.website && (
                    <a
                      href={s.website}
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
                      onClick={() => openEdit(s)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Scholarship' : 'Add Scholarship'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-text">Scholarship Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Chevening Scholarship"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Provider</label>
              <input
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                placeholder="e.g. UK Government"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. United Kingdom"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as Scholarship['level'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Scholarship['status'] })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Amount</label>
              <input
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 15000"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Currency</label>
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                placeholder="e.g. USD"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Application Opens</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Application Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">Award Period Ends</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
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
              <label className="block text-sm font-semibold text-text">Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. fully funded, STEM, women"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Eligibility</label>
            <textarea
              value={form.eligibility}
              onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
              rows={2}
              placeholder="Who can apply..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Requirements</label>
            <textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={2}
              placeholder="Documents, GPA, test scores..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Scholarship details..."
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
