import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ToastProvider, StoreProvider, useAuth } from './context/ctx.jsx'
import LandingPage   from './pages/LandingPage.jsx'
import LoginPage     from './pages/LoginPage.jsx'
import AdminPortal   from './pages/admin/AdminPortal.jsx'
import TeacherPortal from './pages/teacher/TeacherPortal.jsx'
import StudentPortal from './pages/student/StudentPortal.jsx'
import ParentPortal  from './pages/parent/ParentPortal.jsx'
import DemoPortal    from './pages/demo/DemoPortal.jsx'

function Guard({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div className="spinner" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"          element={<LandingPage />} />
              <Route path="/login"     element={<LoginPage />} />
              <Route path="/portal"    element={<RoleRedirect />} />
              <Route path="/admin/*"   element={<Guard roles={['admin']}><AdminPortal /></Guard>} />
              <Route path="/teacher/*" element={<Guard roles={['teacher','admin']}><TeacherPortal /></Guard>} />
              <Route path="/student/*" element={<Guard roles={['student']}><StudentPortal /></Guard>} />
              <Route path="/parent/*"  element={<Guard roles={['parent']}><ParentPortal /></Guard>} />
              <Route path="/demo/*"    element={<Guard roles={['demo']}><DemoPortal /></Guard>} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
