import { useEffect } from 'react'

export default function Modal({ open, onClose, title, size = 'md', children, footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null

  const maxW = { sm: 480, md: 620, lg: 800, xl: 960 }[size] || 620

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: maxW, animation: 'fadeUp .25s ease' }}>
        <div className="mhdr">
          <div>
            {typeof title === 'string'
              ? <div className="serif" style={{ fontSize: 22, color: 'var(--s900)' }}>{title}</div>
              : title}
          </div>
          <button className="mx" onClick={onClose}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="mbody">{children}</div>
        {footer && <div className="mfooter">{footer}</div>}
      </div>
    </div>
  )
}
