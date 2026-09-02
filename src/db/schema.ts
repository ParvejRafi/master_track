import Dexie, { type EntityTable } from 'dexie'
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

const db = new Dexie('mastertrack') as Dexie & {
  universities: EntityTable<University, 'id'>
  programs: EntityTable<Program, 'id'>
  applications: EntityTable<Application, 'id'>
  tasks: EntityTable<Task, 'id'>
  documents: EntityTable<Document, 'id'>
  notes: EntityTable<Note, 'id'>
  professors: EntityTable<Professor, 'id'>
  scholarships: EntityTable<Scholarship, 'id'>
  conferences: EntityTable<Conference, 'id'>
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

db.version(3).stores({
  scholarships: 'id, name, provider, country, level, status, deadline, startDate, createdAt, updatedAt',
})

db.version(4).stores({
  conferences: 'id, name, organizer, country, type, status, deadline, startDate, createdAt, updatedAt',
})

export default db
