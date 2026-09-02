import { Link, Navigate } from 'react-router-dom'
import {
  GraduationCap,
  Building2,
  Users,
  Briefcase,
  CalendarDays,
  CheckSquare,
  FileText,
  Award,
  Mic,
  KeyRound,
  UserPlus,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: Building2, title: 'Universities & Programs', desc: 'Organize target schools by country, with program details per university.' },
  { icon: Users, title: 'Professors', desc: 'Track potential supervisors: contact status, research areas, and fit notes.' },
  { icon: Briefcase, title: 'Applications', desc: 'A status-pipeline board with deadlines, funding info, and auto-tracked progress.' },
  { icon: CalendarDays, title: 'Calendar', desc: 'Every opens-date, deadline, and task due-date on one month grid.' },
  { icon: CheckSquare, title: 'Tasks', desc: 'A general task tracker, linkable to applications and universities.' },
  { icon: FileText, title: 'Documents', desc: 'Track files, expiry dates, and categories in one vault.' },
  { icon: Award, title: 'Scholarships', desc: 'Research and track funding opportunities alongside your applications.' },
  { icon: Mic, title: 'Conferences', desc: 'Track submissions, deadlines, and attendance for academic events.' },
]

const steps = [
  { icon: KeyRound, title: 'Get an access code', desc: 'An admin issues you a one-time invite code — no self-serve signup.' },
  { icon: UserPlus, title: 'Create your account', desc: 'Pick a username and use the code once to claim your account.' },
  { icon: LayoutDashboard, title: 'Track everything', desc: 'Sign in anytime with your username/email and that same code.' },
]

export default function Landing() {
  const { accessToken } = useAuth()

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover shadow-sm">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-text">MasterTrack</span>
          </div>
          <Link
            to="/login"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-all duration-200 hover:bg-surface-hover active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center animate-fade-in">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Invite-only · Your data is private to your account
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Your master's applications, actually under control.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted leading-relaxed">
            A personal command center for tracking universities, professors, applications, and
            deadlines — all in one place, backed by your own account.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-95"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login?mode=register"
              className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-all duration-200 hover:bg-surface-hover active:scale-95"
            >
              I have an invite code
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-surface/60">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-text">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text">How access works</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted">
            No open signup. Accounts are created with a code issued by an admin.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-subtle">Step {i + 1}</p>
                <h3 className="mt-1 text-sm font-semibold text-text">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-subtle sm:flex-row">
          <span>MasterTrack — a personal command center for research program applications.</span>
          <span>Your data is scoped to your account and never shared.</span>
        </div>
      </footer>
    </div>
  )
}
