import { useState } from 'react'
import { Plus, Pencil, Trash2, MapPin, Globe, ExternalLink } from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import QuickAddSchool from '../components/QuickAddSchool'
import type { University } from '../types'

const types: University['type'][] = ['Public', 'Private', 'Research', 'Other']

const normalizeCountry = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return 'Unspecified'
  return trimmed
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const emptyUniversity: Omit<University, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  country: '',
  city: '',
  type: 'Public',
  website: '',
  description: '',
  notes: '',
}

export default function Universities() {
  const universities = useCollection('universities')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<University | null>(null)
  const [form, setForm] = useState(emptyUniversity)
  const [countryFilter, setCountryFilter] = useState('')

  const countries = [...new Set(universities.map((u) => normalizeCountry(u.country)))]
    .filter((c) => c !== 'Unspecified')
    .sort((a, b) => a.localeCompare(b))

  const filtered = countryFilter
    ? universities.filter((u) => normalizeCountry(u.country) === countryFilter)
    : universities

  const groupedByCountry = filtered.reduce<Record<string, University[]>>((acc, uni) => {
    const key = normalizeCountry(uni.country)
    acc[key] = acc[key] || []
    acc[key].push(uni)
    return acc
  }, {})

  const sortedCountries = Object.keys(groupedByCountry).sort((a, b) => a.localeCompare(b))
  for (const key of sortedCountries) {
    groupedByCountry[key].sort((a, b) => a.name.localeCompare(b.name))
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyUniversity)
    setIsOpen(true)
  }

  const openEdit = (uni: University) => {
    setEditing(uni)
    setForm({
      name: uni.name,
      country: uni.country,
      city: uni.city,
      type: uni.type,
      website: uni.website,
      description: uni.description,
      notes: uni.notes,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const cleanForm = { ...form, country: form.country.trim(), city: form.city.trim() }
    if (editing) {
      await apiDb.universities.update(editing.id, { ...cleanForm, updatedAt: now })
    } else {
      await apiDb.universities.add({
        ...cleanForm,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this university?')) {
      await apiDb.universities.delete(id)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Universities</h1>
          <p className="mt-2 text-muted">
            {universities.length === 0
              ? 'Add your target universities to get started.'
              : `Managing ${universities.length} university${universities.length !== 1 ? 'ies' : 'y'}`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {countries.length > 1 && (
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <QuickAddSchool variant="outline" />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add University
          </button>
        </div>
      </div>

      {universities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 animate-fade-in">
          <div className="rounded-full bg-primary-soft p-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No universities yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Start building your research database by adding universities you're interested in.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Your First University
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCountries.map((country) => (
            <div key={country}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{country}</h2>
                <span className="rounded-lg bg-surface-hover px-2 py-0.5 text-xs font-semibold text-muted">
                  {groupedByCountry[country].length}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {groupedByCountry[country].map((uni, i) => (
                  <div
                    key={uni.id}
                    className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text truncate">{uni.name}</h3>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {uni.city}, {uni.country}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(uni)}
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(uni.id)}
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted line-clamp-2 leading-relaxed">
                      {uni.description || 'No description'}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted">
                        {uni.type}
                      </span>
                      {uni.website && (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit University' : 'Add University'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text">University Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Qatar University"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text">Country</label>
              <input
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Qatar"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Doha"
                className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as University['type'] })}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
              placeholder="Brief description of the university..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Your personal notes..."
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
