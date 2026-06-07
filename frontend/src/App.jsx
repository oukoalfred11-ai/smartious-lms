import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

/**
 * App router.
 *
 * Wraps everything in <BrowserRouter> so the React Router hooks
 * (useNavigate, useLocation, useParams) inside LandingPage work.
 *
 * Uses a single wildcard route ("/*") that mounts LandingPage for every
 * path. LandingPage reads location.pathname internally (see its useEffect
 * around lines ~2042-2217) and renders the correct page based on its own
 * PAGES array.
 *
 * This means adding new pages requires NO changes to App.jsx — just add
 * the new page id to the PAGES array in LandingPage.jsx and add a matching
 * `{page === 'your-new-page' && ( ... )}` block.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
