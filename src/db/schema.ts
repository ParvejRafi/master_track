import Dexie, { type EntityTable } from 'dexie'
import type {
  University,
  Program,
  Application,
  Task,
  Document,
  Note,
  Professor,
} from '../types'

const db = new Dexie('mastertrack') as Dexie & {
  universities: EntityTable<University, 'id'>
  programs: EntityTable<Program, 'id'>
  applications: EntityTable<Application, 'id'>
  tasks: EntityTable<Task, 'id'>
  documents: EntityTable<Document, 'id'>
  notes: EntityTable<Note, 'id'>
  professors: EntityTable<Professor, 'id'>
}

db.version(1).stores({
  universities: 'id, name, country, city, type, createdAt, updatedAt',
  programs: 'id, universityId, name, degree, createdAt, updatedAt',
  applications:
    'id, programId, universityId, status, priority, deadline, createdAt, updatedAt',
  tasks: 'id, status, priority, dueDate, category, applicationId, createdAt',
  documents: 'id, category, name, createdAt',
  notes: 'id, category, universityId, programId, applicationId, createdAt, updatedAt',
})

db.version(2).stores({
  professors:
    'id, universityId, programId, contactStatus, priority, createdAt, updatedAt',
})

export default db
