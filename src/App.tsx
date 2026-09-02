import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Universities from './pages/Universities'
import Programs from './pages/Programs'
import Professors from './pages/Professors'
import Applications from './pages/Applications'
import CalendarView from './pages/CalendarView'
import Tasks from './pages/Tasks'
import Documents from './pages/Documents'
import Notes from './pages/Notes'
import Scholarships from './pages/Scholarships'
import Conferences from './pages/Conferences'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import Landing from './pages/Landing'
import { useAuth } from './context/AuthContext'

function RequireAuth({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth()
  if (!accessToken) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/professors" element={<Professors />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/conferences" element={<Conferences />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
