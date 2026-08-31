# MasterTrack

A personal command center for tracking master's/research program applications — universities, programs, professors, applications, tasks, and documents, all stored locally in the browser (IndexedDB via Dexie).

## Features

- **Universities & Programs** — organize target schools by country, with program details per university.
- **Professors** — track potential research supervisors: contact status, research areas, relevant papers, lab/research center links, and fit notes.
- **Applications** — a status-pipeline board with opens-date/deadline tracking, funding info, and a checklist-driven progress bar (progress is computed automatically from linked task completion).
- **Calendar** — a month grid showing every application opens-date, deadline, and task due-date together.
- **Tasks** — a general task tracker, linkable to applications and universities.
- **Documents** — track files, expiry dates, and categories.
- **Live countdowns** — real-time "opens in" / "deadline in" badges that tick down without a page refresh.
- **Dark mode** and **local JSON backup/restore**, all in Settings.
- **Mobile-friendly** — responsive layout with a collapsible sidebar drawer.

All data stays on-device — nothing is sent to a server.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Dexie (IndexedDB) + dexie-react-hooks
- React Router
- date-fns

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build
