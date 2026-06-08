import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
import PopupModal        from './components/PopupModal.jsx'

/**
 * App router — restored from chat history with one critical change:
 *
 *   The catch-all `<Route path="*">` now renders <LandingPage /> instead
 *   of `<Navigate to="/" replace />`. This lets LandingPage handle ALL
 *   its internal pages (/us-families, /about, /pricing, /blog/:slug,
 *   /enroll, /consult, etc.) via its own pathname-reading useEffect,
 *   instead of redirecting every unknown path to home.
 *
 *   The home route `/` still uses LandingWithPopup so the Singapore
 *   trip popup only fires on the actual landing page, not on every
 *   sub-page.
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
  return <Navigate to={`/${user.role}`} replace />
}

// Landing route — bundles the landing page with the 30-second trip popup
function LandingWithPopup() {
  const nav = useNavigate()
  return (
    <>
      <LandingPage />
      <PopupModal
        onCta={() => nav('/enroll')}
        onLearnMore={() => nav('/programs')}
      />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"               element={<LandingWithPopup />} />
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/admin-login"    element={<AdminLoginPage />} />
              <Route path="/verify-email"   element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/portal"         element={<RoleRedirect />} />
              <Route path="/admin/*"        element={<Guard roles={['admin']}><AdminPortal /></Guard>} />
              <Route path="/teacher/*"      element={<Guard roles={['teacher','admin']}><TeacherPortal /></Guard>} />
              <Route path="/student/*"      element={<Guard roles={['student']}><StudentPortal /></Guard>} />
              <Route path="/parent/*"       element={<Guard roles={['parent']}><ParentPortal /></Guard>} />
              <Route path="/demo/*"         element={<Guard roles={['demo']}><DemoPortal /></Guard>} />
              {/* Catch-all → LandingPage (handles /us-families, /about, /pricing, /blog/*, etc.) */}
              <Route path="*"               element={<LandingPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
