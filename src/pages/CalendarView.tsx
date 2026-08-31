import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  AlertTriangle,
  CheckSquare,
  CalendarDays,
} from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday as isDateToday,
  addMonths,
  subMonths,
} from 'date-fns'
import db from '../db/schema'

type CalendarEvent = {
  id: string
  date: string
  type: 'opens' | 'deadline' | 'task'
  title: string
  subtitle: string
  linkTo: string
  priority?: string
}

const typeStyles: Record<CalendarEvent['type'], { chip: string; dot: string; label: string }> = {
  opens: { chip: 'bg-info-soft text-info', dot: 'bg-info', label: 'Opens' },
  deadline: { chip: 'bg-danger-soft text-danger', dot: 'bg-danger', label: 'Deadline' },
  task: { chip: 'bg-warning-soft text-warning', dot: 'bg-warning', label: 'Task' },
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView() {
  const universities = useLiveQuery(() => db.universities.toArray()) || []
  const programs = useLiveQuery(() => db.programs.toArray()) || []
  const applications = useLiveQuery(() => db.applications.toArray()) || []
  const tasks = useLiveQuery(() => db.tasks.toArray()) || []

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())

  const events: CalendarEvent[] = (() => {
    const list: CalendarEvent[] = []
    for (const app of applications) {
      const uni = universities.find((u) => u.id === app.universityId)
      const prog = programs.find((p) => p.id === app.programId)
      const name = uni?.name || 'Unknown University'
      const progName = prog?.name || 'Unknown Program'
      if (app.opensDate) {
        list.push({
          id: `${app.id}-opens`,
          date: app.opensDate,
          type: 'opens',
          title: name,
          subtitle: `${progName} · opens`,
          linkTo: '/applications',
        })
      }
      if (app.deadline) {
        list.push({
          id: `${app.id}-deadline`,
          date: app.deadline,
          type: 'deadline',
          title: name,
          subtitle: `${progName} · deadline`,
          linkTo: '/applications',
        })
      }
    }
    for (const task of tasks) {
      if (task.dueDate && task.status !== 'done') {
        list.push({
          id: `task-${task.id}`,
          date: task.dueDate,
          type: 'task',
          title: task.title,
          subtitle: task.category,
          linkTo: '/tasks',
          priority: task.priority,
        })
      }
    }
    return list
  })()

  const eventsByDate: Record<string, CalendarEvent[]> = {}
  for (const ev of events) {
    eventsByDate[ev.date] = eventsByDate[ev.date] || []
    eventsByDate[ev.date].push(ev)
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const goPrev = () => setCurrentMonth((m) => subMonths(m, 1))
  const goNext = () => setCurrentMonth((m) => addMonths(m, 1))
  const goToday = () => {
    const now = new Date()
    setCurrentMonth(startOfMonth(now))
    setSelectedDate(now)
  }

  const selectedKey = format(selectedDate, 'yyyy-MM-dd')
  const selectedEvents = (eventsByDate[selectedKey] || []).sort((a, b) => a.type.localeCompare(b.type))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Calendar</h1>
          <p className="mt-2 text-muted">All opens-dates, deadlines & task due-dates in one view.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-muted">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${typeStyles.opens.dot}`} /> Opens
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${typeStyles.deadline.dot}`} /> Deadline
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${typeStyles.task.dot}`} /> Task
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-surface-hover"
            >
              Today
            </button>
            <button
              onClick={goPrev}
              className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-subtle">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[key] || []
            const inMonth = isSameMonth(day, currentMonth)
            const today = isDateToday(day)
            const selected = isSameDay(day, selectedDate)
            const busy = dayEvents.length >= 3

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[52px] sm:min-h-[104px] border-b border-r border-border p-1 sm:p-1.5 text-left transition-colors last:border-r-0 ${
                  inMonth ? 'bg-surface' : 'bg-page/60'
                } ${selected ? 'ring-2 ring-inset ring-primary' : ''} ${busy && inMonth ? 'bg-warning-soft/30' : ''} hover:bg-surface-hover`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    today ? 'bg-primary text-white' : inMonth ? 'text-text' : 'text-subtle'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* compact dots on narrow screens */}
                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {dayEvents.slice(0, 4).map((ev) => (
                    <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${typeStyles[ev.type].dot}`} />
                  ))}
                </div>

                {/* full chips on larger screens */}
                <div className="mt-1 hidden space-y-1 sm:block">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${typeStyles[ev.type].chip}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] font-medium text-subtle">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-text">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
          </div>
        </div>
        <div className="p-4">
          {selectedEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nothing scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev) => (
                <Link
                  key={ev.id}
                  to={ev.linkTo}
                  className="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${typeStyles[ev.type].chip}`}
                    >
                      {ev.type === 'opens' && <DoorOpen className="h-4 w-4" />}
                      {ev.type === 'deadline' && <AlertTriangle className="h-4 w-4" />}
                      {ev.type === 'task' && <CheckSquare className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{ev.title}</p>
                      <p className="text-xs text-muted">{ev.subtitle}</p>
                    </div>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${typeStyles[ev.type].chip}`}>
                    {typeStyles[ev.type].label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
