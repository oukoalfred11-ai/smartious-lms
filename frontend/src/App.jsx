import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ToastProvider, StoreProvider, useAuth } from './context/ctx.jsx'

// ─────────────────────────────────────────────────────────
// Code-splitting via React.lazy.
// Each lazy() import becomes a separate chunk that loads
// only when the route is visited. This means:
//   - Visitors to the homepage download ONLY LandingPage
//   - Logged-in students download ONLY StudentPortal
//   - The other portal bundles never load for them
//
// The vite.config.js manualChunks rules group these correctly:
// portal-admin.[hash].js, portal-teacher.[hash].js, etc.
// ─────────────────────────────────────────────────────────
const LandingPage       = lazy(() => import('./pages/LandingPage.jsx'))
const LoginPage         = lazy(() => import('./pages/LoginPage.jsx'))
const AdminLoginPage    = lazy(() => import('./pages/AdminLoginPage.jsx'))
const VerifyEmailPage   = lazy(() => import('./pages/VerifyEmailPage.jsx'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'))
const AdminPortal       = lazy(() => import('./pages/admin/AdminPortal.jsx'))
const TeacherPortal     = lazy(() => import('./pages/teacher/TeacherPortal.jsx'))
const StudentPortal     = lazy(() => import('./pages/student/StudentPortal.jsx'))
const ParentPortal      = lazy(() => import('./pages/parent/ParentPortal.jsx'))
const DemoPortal        = lazy(() => import('./pages/demo/DemoPortal.jsx'))

// Shared loading fallback shown while a chunk is being fetched.
// Keeps the visual identity (no flash of unstyled content).
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg, #F7F3ED)',
    }}>
      <div className="spinner" style={{
        width: 32, height: 32,
        border: '3px solid rgba(139,26,46,.15)',
        borderTopColor: '#8B1A2E',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Guard({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader/>
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
            <Suspense fallback={<PageLoader/>}>
              <Routes>
                <Route path="/"                element={<LandingPage />} />
                {/* Landing-page sections — each its own URL */}
                <Route path="/about"           element={<LandingPage />} />
                <Route path="/curricula"       element={<LandingPage />} />
                <Route path="/curricula/:slug" element={<LandingPage />} />
                <Route path="/services"        element={<LandingPage />} />
                <Route path="/services/:slug"  element={<LandingPage />} />
                <Route path="/global"          element={<LandingPage />} />
                <Route path="/pricing"         element={<LandingPage />} />
                <Route path="/programs"        element={<LandingPage />} />
                <Route path="/activities"      element={<LandingPage />} />
                <Route path="/online-school/:slug" element={<LandingPage />} />
                <Route path="/faq"             element={<LandingPage />} />
                <Route path="/blog"            element={<LandingPage />} />
                <Route path="/blog/:slug"      element={<LandingPage />} />
                <Route path="/teachers"        element={<LandingPage />} />
                <Route path="/enroll"          element={<LandingPage />} />
                <Route path="/consult"         element={<LandingPage />} />
                <Route path="/contact"         element={<LandingPage />} />
                <Route path="/privacy"         element={<LandingPage />} />
                <Route path="/terms"           element={<LandingPage />} />
                <Route path="/cookies"         element={<LandingPage />} />
                <Route path="/gdpr"            element={<LandingPage />} />
                <Route path="/login"           element={<LoginPage />} />
                <Route path="/admin-login"     element={<AdminLoginPage />} />
                <Route path="/verify-email"    element={<VerifyEmailPage />} />
                <Route path="/reset-password"  element={<ResetPasswordPage />} />
                <Route path="/portal"          element={<RoleRedirect />} />
                <Route path="/admin/*"         element={<Guard roles={['admin']}><AdminPortal /></Guard>} />
                <Route path="/teacher/*"       element={<Guard roles={['teacher','admin']}><TeacherPortal /></Guard>} />
                <Route path="/student/*"       element={<Guard roles={['student']}><StudentPortal /></Guard>} />
                <Route path="/parent/*"        element={<Guard roles={['parent']}><ParentPortal /></Guard>} />
                <Route path="/demo/*"          element={<Guard roles={['demo']}><DemoPortal /></Guard>} />
                <Route path="*"                element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
