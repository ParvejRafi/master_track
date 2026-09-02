import { useMemo } from 'react'
import {
  Building2,
  GraduationCap,
  Briefcase,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  DoorOpen,
  Users,
  Award,
  Mic,
} from 'lucide-react'
import { useCollection } from '../lib/apiDb'
import StatsCard from '../components/StatsCard'
import CountdownBadge from '../components/CountdownBadge'
import LiveCountdownHero from '../components/LiveCountdownHero'
import QuickAddSchool from '../components/QuickAddSchool'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const universities = useCollection('universities')
  const programs = useCollection('programs')
  const applications = useCollection('applications')
  const tasks = useCollection('tasks')
  const professors = useCollection('professors')
  const scholarships = useCollection('scholarships')
  const conferences = useCollection('conferences')

  const totalUniversities = universities.length
  const totalPrograms = programs.length
  const totalApplications = applications.length
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length
  const totalScholarships = scholarships.length
  const totalConferences = conferences.length

  const upcomingDeadlines = applications
    .filter((a) => a.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  const upcomingScholarshipDeadlines = scholarships
    .filter((s) => s.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  const upcomingConferenceDeadlines = conferences
    .filter((c) => c.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  const now = useMemo(() => new Date().getTime(), [])

  const nextDeadline = applications
    .filter((a) => a.deadline && new Date(a.deadline).getTime() >= now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]

  const openingsSoon = applications
    .filter((a) => a.opensDate && new Date(a.opensDate).getTime() >= now)
    .sort((a, b) => new Date(a.opensDate!).getTime() - new Date(b.opensDate!).getTime())

  const nextOpening = openingsSoon[0]

  const awaitingReplyCount = professors.filter((p) => p.contactStatus === 'Emailed').length

  const todayTasks = tasks
    .filter((t) => t.status !== 'done' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Accepted': 'bg-success-soft text-success',
      'Rejected': 'bg-danger-soft text-danger',
      'Submitted': 'bg-info-soft text-info',
      'Under Review': 'bg-warning-soft text-warning',
      'Interview': 'bg-primary-soft text-primary',
    }
    return colors[status] || 'bg-surface-hover text-muted'
  }

  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  const acceptedCount = statusCounts['Accepted'] || 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted">
            Welcome back. Here's what's happening with your applications.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-muted sm:flex">
            <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
            Active tracking
          </div>
          <QuickAddSchool />
        </div>
      </div>

      {(nextDeadline || nextOpening) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {nextDeadline && (
            <LiveCountdownHero
              title={universities.find((u) => u.id === nextDeadline.universityId)?.name || 'Unknown'}
              subtitle={programs.find((p) => p.id === nextDeadline.programId)?.name || 'Unknown Program'}
              date={nextDeadline.deadline}
              kind="deadline"
            />
          )}
          {nextOpening && (
            <LiveCountdownHero
              title={universities.find((u) => u.id === nextOpening.universityId)?.name || 'Unknown'}
              subtitle={programs.find((p) => p.id === nextOpening.programId)?.name || 'Unknown Program'}
              date={nextOpening.opensDate!}
              kind="opens"
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Universities"
          value={totalUniversities}
          icon={<Building2 className="h-5 w-5" />}
          color="primary"
        />
        <StatsCard
          title="Programs"
          value={totalPrograms}
          icon={<GraduationCap className="h-5 w-5" />}
          color="info"
        />
        <StatsCard
          title="Professors"
          value={professors.length}
          icon={<Users className="h-5 w-5" />}
          trend={awaitingReplyCount > 0 ? `${awaitingReplyCount} awaiting reply` : undefined}
          color="info"
        />
        <StatsCard
          title="Applications"
          value={totalApplications}
          icon={<Briefcase className="h-5 w-5" />}
          trend={acceptedCount > 0 ? `${acceptedCount} accepted` : undefined}
          color="success"
        />
        <StatsCard
          title="Scholarships"
          value={totalScholarships}
          icon={<Award className="h-5 w-5" />}
          color="warning"
        />
        <StatsCard
          title="Conferences"
          value={totalConferences}
          icon={<Mic className="h-5 w-5" />}
          color="info"
        />
        <StatsCard
          title="Pending Tasks"
          value={`${pendingTasks}/${totalTasks}`}
          icon={<CheckSquare className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {applications.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(statusCounts).slice(0, 4).map(([status, count]) => (
            <div key={status} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{status}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-base font-semibold text-text">Upcoming Deadlines</h2>
            </div>
          </div>
          <div className="p-4">
            {upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-surface-hover p-3">
                  <Briefcase className="h-6 w-6 text-subtle" />
                </div>
                <p className="mt-3 text-sm text-muted">No applications tracked yet.</p>
                <Link
                  to="/applications"
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Add your first application
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((app) => {
                  const uni = universities.find((u) => u.id === app.universityId)
                  const prog = programs.find((p) => p.id === app.programId)
                  return (
                    <Link
                      key={app.id}
                      to="/applications"
                      className="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-sm font-semibold text-muted group-hover:bg-primary-soft group-hover:text-primary transition-colors">
                          {uni?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{uni?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted">{prog?.name || 'Unknown Program'}</p>
                        </div>
                      </div>
                      <CountdownBadge date={app.deadline} />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-text">Today's Tasks</h2>
            </div>
          </div>
          <div className="p-4">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-surface-hover p-3">
                  <CheckSquare className="h-6 w-6 text-subtle" />
                </div>
                <p className="mt-3 text-sm text-muted">No pending tasks.</p>
                <Link
                  to="/tasks"
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Create a task
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        task.priority === 'high' ? 'bg-danger' :
                        task.priority === 'medium' ? 'bg-warning' :
                        'bg-success'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-text">{task.title}</p>
                        <p className="text-xs text-muted">{task.category}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted capitalize">
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              <h2 className="text-base font-semibold text-text">Scholarship Deadlines</h2>
            </div>
          </div>
          <div className="p-4">
            {upcomingScholarshipDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-surface-hover p-3">
                  <Award className="h-6 w-6 text-subtle" />
                </div>
                <p className="mt-3 text-sm text-muted">No scholarships tracked yet.</p>
                <Link
                  to="/scholarships"
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Add a scholarship
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingScholarshipDeadlines.map((s) => (
                  <Link
                    key={s.id}
                    to="/scholarships"
                    className="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-sm font-semibold text-muted group-hover:bg-warning-soft group-hover:text-warning transition-colors">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{s.name}</p>
                        <p className="text-xs text-muted">{s.provider} · {s.country}</p>
                      </div>
                    </div>
                    <CountdownBadge date={s.deadline} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-info" />
              <h2 className="text-base font-semibold text-text">Conference Deadlines</h2>
            </div>
          </div>
          <div className="p-4">
            {upcomingConferenceDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-surface-hover p-3">
                  <Mic className="h-6 w-6 text-subtle" />
                </div>
                <p className="mt-3 text-sm text-muted">No conferences tracked yet.</p>
                <Link
                  to="/conferences"
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Add a conference
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingConferenceDeadlines.map((c) => (
                  <Link
                    key={c.id}
                    to="/conferences"
                    className="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-sm font-semibold text-muted group-hover:bg-info-soft group-hover:text-info transition-colors">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{c.name}</p>
                        <p className="text-xs text-muted">{c.organizer} · {c.country}</p>
                      </div>
                    </div>
                    <CountdownBadge date={c.deadline} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-info" />
              <h2 className="text-base font-semibold text-text">Opening Soon</h2>
            </div>
          </div>
          <div className="p-4">
            {openingsSoon.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-surface-hover p-3">
                  <DoorOpen className="h-6 w-6 text-subtle" />
                </div>
                <p className="mt-3 text-sm text-muted">No upcoming portal openings tracked.</p>
                <Link
                  to="/applications"
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Set an opens date
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {openingsSoon.slice(0, 5).map((app) => {
                  const uni = universities.find((u) => u.id === app.universityId)
                  const prog = programs.find((p) => p.id === app.programId)
                  return (
                    <Link
                      key={app.id}
                      to="/applications"
                      className="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-sm font-semibold text-muted group-hover:bg-info-soft group-hover:text-info transition-colors">
                          {uni?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{uni?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted">{prog?.name || 'Unknown Program'}</p>
                        </div>
                      </div>
                      <CountdownBadge date={app.opensDate!} />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-text">Research Outreach</h2>
            </div>
          </div>
          <div className="p-4">
            {professors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-surface-hover p-3">
                  <Users className="h-6 w-6 text-subtle" />
                </div>
                <p className="mt-3 text-sm text-muted">No professors tracked yet.</p>
                <Link
                  to="/professors"
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Add a professor
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {professors.slice(0, 5).map((prof) => {
                  const uni = universities.find((u) => u.id === prof.universityId)
                  return (
                    <Link
                      key={prof.id}
                      to="/professors"
                      className="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-sm font-semibold text-muted group-hover:bg-primary-soft group-hover:text-primary transition-colors">
                          {prof.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{prof.name}</p>
                          <p className="text-xs text-muted">{uni?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted">
                        {prof.contactStatus}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
