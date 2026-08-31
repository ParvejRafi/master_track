import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Universities from './pages/Universities'
import Programs from './pages/Programs'
import Professors from './pages/Professors'
import Applications from './pages/Applications'
import CalendarView from './pages/CalendarView'
import Tasks from './pages/Tasks'
import Documents from './pages/Documents'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/professors" element={<Professors />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
