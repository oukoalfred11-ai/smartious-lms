import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ToastProvider, StoreProvider, useAuth } from './context/ctx.jsx'
import LandingPage       from './pages/LandingPage.jsx'
import LoginPage         from './pages/LoginPage.jsx'
import AdminLoginPage    from './pages/AdminLoginPage.jsx'
import VerifyEmailPage   from './pages/VerifyEmailPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import AdminPortal       from './pages/admin/AdminPortal.jsx'
import OpsPortal         from './pages/admin/OpsPortal.jsx'
import AccountsPortal    from './pages/admin/AccountsPortal.jsx'
import SalesPortal       from './pages/admin/SalesPortal.jsx'
import TeacherPortal     from './pages/teacher/TeacherPortal.jsx'
import StudentPortal     from './pages/student/StudentPortal.jsx'
import ParentPortal      from './pages/parent/ParentPortal.jsx'
import DemoPortal        from './pages/demo/DemoPortal.jsx'

/**
 * App router.
 *
 * Catch-all route mounts <LandingPage /> for any unmatched path, so
 * LandingPage handles /us-families, /about, /pricing, /blog/:slug,
 * /enroll, /consult and all other marketing pages via its own
 * pathname-reading useEffect.
 *
 * LMS portal routes (/admin, /teacher, /student, /parent, /demo) and
 * auth pages (/login, /admin-login, /verify-email, /reset-password)
 * take precedence over the catch-all.
 */

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
  const ROLE_PATHS = {
    admin:       '/admin',
    ops_manager: '/ops',
    accountant:  '/accounts',
    sales:       '/sales',
    teacher:     '/teacher',
    student:     '/student',
    parent:      '/parent',
    demo:        '/demo',
  }
  return <Navigate to={ROLE_PATHS[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/admin-login"    element={<AdminLoginPage />} />
              <Route path="/verify-email"   element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/portal"         element={<RoleRedirect />} />
              <Route path="/admin/*"        element={<Guard roles={['admin']}><AdminPortal /></Guard>} />
              <Route path="/ops/*"          element={<Guard roles={['ops_manager','admin']}><OpsPortal /></Guard>} />
              <Route path="/accounts/*"     element={<Guard roles={['accountant','admin']}><AccountsPortal /></Guard>} />
              <Route path="/sales/*"        element={<Guard roles={['sales','admin']}><SalesPortal /></Guard>} />
              <Route path="/teacher/*"      element={<Guard roles={['teacher','admin']}><TeacherPortal /></Guard>} />
              <Route path="/student/*"      element={<Guard roles={['student']}><StudentPortal /></Guard>} />
              <Route path="/parent/*"       element={<Guard roles={['parent']}><ParentPortal /></Guard>} />
              <Route path="/demo/*"         element={<Guard roles={['demo']}><DemoPortal /></Guard>} />
              {/* Catch-all → LandingPage (handles /, /us-families, /about, /pricing, /blog/*, etc.) */}
              <Route path="*"               element={<LandingPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
