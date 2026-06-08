import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/ctx.jsx'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminPortal from './portals/admin/AdminPortal'
import TeacherPortal from './portals/teacher/TeacherPortal'
import StudentPortal from './portals/student/StudentPortal'
import ParentPortal from './portals/parent/ParentPortal'

/**
 * App router.
 *
 * Provider order (outer to inner):
 *   1. StoreProvider — global app state (user, auth, cart, etc.)
 *   2. BrowserRouter — React Router context
 *   3. Routes — explicit LMS portal routes, then wildcard for LandingPage
 *
 * Route order matters in React Router 6:
 *   - More specific routes first (LMS portals, LoginPage)
 *   - Wildcard "/*" LAST — catches anything else and mounts LandingPage
 *
 * The /* (with trailing /*) on portal routes means "match /admin AND
 * /admin/dashboard AND any nested path" — letting each portal handle
 * its own internal sub-routing.
 */
export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone LoginPage — the redesigned one */}
          <Route path="/login" element={<LoginPage />} />

          {/* LMS portals — each handles its own internal routing */}
          <Route path="/admin/*"   element={<AdminPortal />} />
          <Route path="/teacher/*" element={<TeacherPortal />} />
          <Route path="/student/*" element={<StudentPortal />} />
          <Route path="/parent/*"  element={<ParentPortal />} />

          {/* Marketing site — catch-all for the rest */}
          <Route path="/*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
