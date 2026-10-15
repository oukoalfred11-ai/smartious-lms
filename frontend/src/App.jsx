import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, ToastProvider, StoreProvider, useAuth } from './context/ctx.jsx'
import LandingPage       from './pages/LandingPage.jsx'
import LoginPage         from './pages/LoginPage.jsx'
import PausedScreen from './components/PausedScreen.jsx'
import AssessmentPaymentResult from './components/AssessmentPaymentResult.jsx'
import AdminLoginPage    from './pages/AdminLoginPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

// The portals load only when someone opens them. Before this, every
// website visitor downloaded the whole system (admin, teacher and
// student portals, syllabus data, the video classroom): about 3 MB
// compressed of code a parent reading the homepage never uses.
const ClassroomPage  = lazy(() => import('./pages/ClassroomPage.jsx'))
const AdminPortal    = lazy(() => import('./pages/admin/AdminPortal.jsx'))
const OpsPortal      = lazy(() => import('./pages/admin/OpsPortal.jsx'))
const DOSPortal      = lazy(() => import('./pages/admin/DOSPortal.jsx'))
const QAPortal       = lazy(() => import('./pages/admin/QAPortal.jsx'))
const AccountsPortal = lazy(() => import('./pages/admin/AccountsPortal.jsx'))
const SalesPortal    = lazy(() => import('./pages/admin/SalesPortal.jsx'))
const TeacherPortal  = lazy(() => import('./pages/teacher/TeacherPortal.jsx'))
const StudentPortal  = lazy(() => import('./pages/student/StudentPortal.jsx'))
const ParentPortal   = lazy(() => import('./pages/parent/ParentPortal.jsx'))
const DemoPortal     = lazy(() => import('./pages/demo/DemoPortal.jsx'))

// KaTeX draws mathematics in the portals (question bank, exams). The
// website has none, so it is fetched only when a portal opens; until
// then renderMath shows its readable Unicode fallback.
let katexRequested = false
function loadKatex() {
  if (katexRequested || typeof document === 'undefined' || window.katex) return
  katexRequested = true
  const css = document.createElement('link')
  css.rel = 'stylesheet'
  css.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
  css.crossOrigin = 'anonymous'
  document.head.appendChild(css)
  const js = document.createElement('script')
  js.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js'
  js.defer = true
  js.crossOrigin = 'anonymous'
  document.head.appendChild(js)
}

function PortalLoading() {
  useEffect(() => { loadKatex() }, [])
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div className="spinner" />
    </div>
  )
}
// A portal screen: shows a spinner while its code downloads, and starts
// KaTeX loading alongside it.
const P = ({ children }) => {
  useEffect(() => { loadKatex() }, [])
  return <Suspense fallback={<PortalLoading />}>{children}</Suspense>
}

/**
 * App router.
 *
 * Catch-all route mounts <LandingPage /> for any unmatched path, so
 * LandingPage handles /us-families, /about, /pricing, /blog/:slug,
 * /enroll, /consult and all other marketing pages via its own
 * pathname-reading useEffect.
 *
 * LMS portal routes (/admin, /teacher, /student, /parent, /demo) and
 * auth pages (/login, /admin-login, /reset-password)
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
  // Wrong portal for this role: let RoleRedirect pick the right one
  // (ops_manager lives at /ops and accountant at /accounts, not /<role>).
  if (roles && !roles.includes(user.role)) return <Navigate to="/portal" replace />
  return children
}

// Paystack sends parents back here after an assessment payment
// (backend routes/assessment.js payment-callback).
function AssessmentPaymentResultPage() {
  const navigate = useNavigate()
  return <AssessmentPaymentResult nav={(to) => navigate(to)} />
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const ROLE_PATHS = {
    admin:       '/admin',
    ops_manager: '/ops',
    dos:         '/dos',
    qa:          '/qa',
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
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/portal"         element={<RoleRedirect />} />
              <Route path="/paused"         element={<PausedScreen />} />
              <Route path="/assessment/payment-result" element={<AssessmentPaymentResultPage />} />
              <Route path="/classroom/:liveClassId" element={<Guard roles={['teacher','student','admin','dos','ops_manager','parent']}><P><ClassroomPage /></P></Guard>} />
              <Route path="/admin/*"        element={<Guard roles={['admin']}><P><AdminPortal /></P></Guard>} />
              <Route path="/ops/*"          element={<Guard roles={['ops_manager','dos','admin']}><P><OpsPortal /></P></Guard>} />
              <Route path="/dos/*"          element={<Guard roles={['dos','ops_manager','admin']}><P><DOSPortal /></P></Guard>} />
              <Route path="/qa/*"           element={<Guard roles={['qa','admin']}><P><QAPortal /></P></Guard>} />
              <Route path="/accounts/*"     element={<Guard roles={['accountant','admin']}><P><AccountsPortal /></P></Guard>} />
              <Route path="/sales/*"        element={<Guard roles={['sales','admin']}><P><SalesPortal /></P></Guard>} />
              <Route path="/teacher/*"      element={<Guard roles={['teacher','admin']}><P><TeacherPortal /></P></Guard>} />
              <Route path="/student/*"      element={<Guard roles={['student']}><P><StudentPortal /></P></Guard>} />
              <Route path="/parent/*"       element={<Guard roles={['parent']}><P><ParentPortal /></P></Guard>} />
              <Route path="/demo/*"         element={<Guard roles={['demo']}><P><DemoPortal /></P></Guard>} />
              {/* Catch-all → LandingPage (handles /, /us-families, /about, /pricing, /blog/*, etc.) */}
              <Route path="*"               element={<LandingPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
