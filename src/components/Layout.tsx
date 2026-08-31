import { type ReactNode, useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-page antialiased">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 sm:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-medium text-muted">MasterTrack</h2>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-xs font-bold text-white shadow-sm">
              MT
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
