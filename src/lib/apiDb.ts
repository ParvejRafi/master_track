import { useEffect, useState } from 'react'
import api from './api'
import type {
  University,
  Program,
  Application,
  Task,
  Document,
  Note,
  Professor,
  Scholarship,
  Conference,
} from '../types'

type WithId = { id: string }
type Listener = () => void

function makeResource<T extends WithId>(resource: string) {
  const path = `/${resource}/`
  let cache: T[] | undefined
  let inflight: Promise<T[]> | undefined
  const listeners = new Set<Listener>()

  const notify = () => listeners.forEach((l) => l())

  return {
    async toArray(): Promise<T[]> {
      if (cache) return cache
      if (!inflight) {
        inflight = api.get<T[]>(path).then((data) => {
          cache = data
          inflight = undefined
          notify()
          return data
        })
      }
      return inflight
    },
    async add(item: T): Promise<T> {
      const created = await api.post<T>(path, item)
      cache = [...(cache ?? []), created]
      notify()
      return created
    },
    async update(id: string, patch: Partial<T>): Promise<T> {
      const updated = await api.patch<T>(`${path}${id}/`, patch)
      cache = (cache ?? []).map((row) => (row.id === id ? updated : row))
      notify()
      return updated
    },
    async delete(id: string): Promise<void> {
      await api.delete(`${path}${id}/`)
      cache = (cache ?? []).filter((row) => row.id !== id)
      notify()
    },
    getCached(): T[] | undefined {
      return cache
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    clearCache() {
      cache = undefined
      inflight = undefined
      notify()
    },
  }
}

const apiDb = {
  universities: makeResource<University>('universities'),
  programs: makeResource<Program>('programs'),
  applications: makeResource<Application>('applications'),
  tasks: makeResource<Task>('tasks'),
  documents: makeResource<Document>('documents'),
  notes: makeResource<Note>('notes'),
  professors: makeResource<Professor>('professors'),
  scholarships: makeResource<Scholarship>('scholarships'),
  conferences: makeResource<Conference>('conferences'),
}

export type ApiDbKey = keyof typeof apiDb

export function useCollection<K extends ApiDbKey>(key: K) {
  type Row = (typeof apiDb)[K] extends { getCached: () => (infer T)[] | undefined } ? T : never
  const resource = apiDb[key]
  const [data, setData] = useState<Row[]>(() => (resource.getCached() as Row[]) ?? [])

  useEffect(() => {
    let mounted = true
    const unsubscribe = resource.subscribe(() => {
      if (mounted) setData((resource.getCached() as Row[]) ?? [])
    })
    resource.toArray().then((rows) => {
      if (mounted) setData(rows as Row[])
    })
    return () => {
      mounted = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return data
}

export function clearApiDbCache() {
  Object.values(apiDb).forEach((resource) => resource.clearCache())
}

export default apiDb
