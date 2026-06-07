import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/ctx.jsx'
import LandingPage from './pages/LandingPage'

/**
 * App router.
 *
 * Provider order (outer to inner):
 *   1. StoreProvider — global app state (user, auth, cart, etc.)
 *                      LandingPage reads this via useStore()
 *   2. BrowserRouter — React Router context
 *                      LandingPage uses useNavigate / useLocation / useParams
 *   3. Routes        — single wildcard route mounting LandingPage
 *
 * LandingPage reads location.pathname internally (see its useEffect around
 * lines ~2042-2217) and renders the correct page based on its own PAGES array.
 *
 * Adding new pages requires NO changes here — just add the page id to PAGES
 * in LandingPage.jsx and a matching `{page === 'your-page' && (...)}` block.
 */
export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
