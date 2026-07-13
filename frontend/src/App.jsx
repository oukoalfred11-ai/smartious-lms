import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ToastProvider, StoreProvider, useAuth } from './context/ctx.jsx'
import LandingPage       from './pages/LandingPage.jsx'
import LoginPage         from './pages/LoginPage.jsx'
import AdminLoginPage    from './pages/AdminLoginPage.jsx'
import VerifyEmailPage   from './pages/VerifyEmailPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import AdminPortal       from './pages/admin/AdminPortal.jsx'
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
  const STAFF_ROLES = ['admin', 'accountant', 'sales', 'ops_manager']
  if (roles && !roles.includes(user.role)) {
    // Staff roles all use the admin portal
    if (STAFF_ROLES.includes(user.role)) return <Navigate to="/admin" replace />
    const STAFF_ROLES2 = ['admin', 'accountant', 'sales', 'ops_manager']
  if (STAFF_ROLES2.includes(user.role)) return <Navigate to="/admin" replace />
  return <Navigate to={`/${user.role}`} replace />
  }
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
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/admin-login"    element={<AdminLoginPage />} />
              <Route path="/verify-email"   element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/portal"         element={<RoleRedirect />} />
              <Route path="/admin/*"        element={<Guard roles={['admin','accountant','sales','ops_manager']}><AdminPortal /></Guard>} />
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
