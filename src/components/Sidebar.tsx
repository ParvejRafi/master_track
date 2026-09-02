import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  CalendarDays,
  CheckSquare,
  FileText,
  StickyNote,
  Award,
  Mic,
  Settings,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/universities', icon: Building2, label: 'Universities' },
  { to: '/programs', icon: GraduationCap, label: 'Programs' },
  { to: '/professors', icon: Users, label: 'Professors' },
  { to: '/applications', icon: Briefcase, label: 'Applications' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/scholarships', icon: Award, label: 'Scholarships' },
  { to: '/conferences', icon: Mic, label: 'Conferences' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { username, logout } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">MT</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-text tracking-tight">MasterTrack</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {username && (
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium text-muted">Account</p>
            <p className="text-sm font-semibold text-text truncate">{username}</p>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-soft text-primary shadow-sm'
                    : 'text-muted hover:bg-surface-hover hover:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted group-hover:text-text'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 text-primary" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4 space-y-3">
          <div className="rounded-lg bg-gradient-to-br from-primary-soft to-surface p-3 border border-border">
            <p className="text-xs font-medium text-text">Personal Command Center</p>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Track universities, applications, conferences & deadlines.
            </p>
          </div>
          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted transition-all duration-200 hover:bg-surface-hover hover:text-text active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
