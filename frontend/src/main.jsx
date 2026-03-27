import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Global error boundary — catches any React render crash
// and shows a readable error instead of a blank page
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  componentDidCatch(e, info) { console.error('React crash:', e, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#0f172a', color: '#fff', minHeight: '100vh' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ color: '#f87171', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
              Smartious — Startup Error
            </div>
            <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 20, color: '#fca5a5', fontSize: 14, lineHeight: 1.7 }}>
              {this.state.error.toString()}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
              This error prevents the app from loading. Common causes:
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Old cached files — delete node_modules/.vite/ and restart</li>
                <li>Wrong file replaced — check all files match the ZIP</li>
                <li>Missing import — a component references something that doesnt exist</li>
              </ul>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.reload() }}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              Clear Cache &amp; Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
