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
              <Route path="/tuition-nairobi"     element={<LandingPage />} />
              <Route path="/tuition/:slug"       element={<LandingPage />} />
              <Route path="/tuition-uae"         element={<LandingPage />} />
              <Route path="/tuition-uae/:slug"   element={<LandingPage />} />
              <Route path="/homeschooling-kenya"      element={<LandingPage />} />
              <Route path="/homeschooling/:slug"      element={<LandingPage />} />
              <Route path="/test-prep"                element={<LandingPage />} />
              <Route path="/test-prep/:slug"          element={<LandingPage />} />
              <Route path="/languages"                element={<LandingPage />} />
              <Route path="/study-abroad"             element={<LandingPage />} />
              <Route path="/study-abroad/:slug"       element={<LandingPage />} />
              <Route path="/homeschool"               element={<LandingPage />} />
              <Route path="/tuition"                  element={<LandingPage />} />
              <Route path="/iufp"                     element={<LandingPage />} />
              <Route path="/pre-university"           element={<LandingPage />} />
              <Route path="/compare/:slug"   element={<LandingPage />} />
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
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
