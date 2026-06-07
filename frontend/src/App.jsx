import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

/**
 * App router.
 *
 * Uses a single wildcard route ("/*") that mounts LandingPage for every path.
 * LandingPage reads location.pathname internally (see its useEffect on lines
 * ~2042-2217) and renders the correct page based on its own PAGES array.
 *
 * This means adding new pages requires NO changes to App.jsx — just add the
 * new page id to the PAGES array in LandingPage.jsx and add a corresponding
 * `{page === 'your-new-page' && ( ... )}` block.
 *
 * BrowserRouter is expected to be in main.jsx wrapping <App/>.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<LandingPage />} />
    </Routes>
  )
}
