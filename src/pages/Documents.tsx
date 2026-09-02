import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, FileText, Upload, Tag } from 'lucide-react'
import apiDb, { useCollection } from '../lib/apiDb'
import Modal from '../components/Modal'
import type { Document } from '../types'

const categories: Document['category'][] = [
  'Academic',
  'Identity',
  'English Test',
  'Certifications',
  'Experience',
  'Application',
  'Scholarship',
  'Other',
]

const emptyDocument: Omit<Document, 'id' | 'createdAt'> = {
  name: '',
  category: 'Academic',
  fileUrl: '',
  expiryDate: '',
  description: '',
  tags: '',
}

export default function Documents() {
  const documents = useCollection('documents')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Document | null>(null)
  const [form, setForm] = useState(emptyDocument)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyDocument)
    setFileName('')
    setIsOpen(true)
  }

  const openEdit = (doc: Document) => {
    setEditing(doc)
    setForm({
      name: doc.name,
      category: doc.category,
      fileUrl: doc.fileUrl,
      expiryDate: doc.expiryDate || '',
      description: doc.description,
      tags: doc.tags,
    })
    setFileName(doc.fileUrl ? 'File attached' : '')
    setIsOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = () => {
        setForm({ ...form, fileUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await apiDb.documents.update(editing.id, form)
    } else {
      await apiDb.documents.add({
        ...form,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this document?')) {
      await apiDb.documents.delete(id)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Documents</h1>
          <p className="mt-2 text-muted">
            {documents.length === 0
              ? 'Upload and organize your application documents.'
              : `${documents.length} document${documents.length !== 1 ? 's' : ''} in vault`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="rounded-full bg-primary-soft p-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No documents yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted">
            Upload your transcripts, passport, CV, and other important documents.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Upload className="h-4 w-4" />
            Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, i) => (
            <div
              key={doc.id}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary-soft p-2.5 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text truncate">{doc.name}</h3>
                    <p className="text-sm text-muted">{doc.category}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(doc)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted line-clamp-2 leading-relaxed">
                {doc.description || 'No description'}
              </p>
              {doc.tags && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doc.tags.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted"
                    >
                      <Tag className="h-3 w-3" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Document' : 'Add Document'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text">Document Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Bachelor's Transcript"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Document['category'] })}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="mt-1.5 block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-hover transition-colors"
            />
            {fileName && <p className="mt-2 text-xs text-muted">{fileName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Document details..."
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">Tags</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. transcript, academic, required"
              className="mt-1.5 w-full rounded-xl border border-border bg-page px-4 py-2.5 text-text placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
