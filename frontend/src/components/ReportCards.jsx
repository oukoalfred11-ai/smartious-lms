/**
 * ReportCards — the student's published end-of-term reports, to view or
 * download as the official PDF (logo, photograph, seal and signatures).
 * Shown at the top of My Results. Parents have the same in their portal.
 */
import { useEffect, useState } from 'react'
import { api } from '../context/ctx.jsx'

const C = { crimson: '#7D1025', gold: '#B8902F', ink: '#2A2018', sepia: '#6E5B45', parchment: '#FBF6EA', line: '#E6D9B8' }
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

export default function ReportCards({ toast }) {
  const [list, setList] = useState(null)
  const [busy, setBusy] = useState('')

  useEffect(() => {
    api.get('/reports/mine').then(r => setList(r.data?.data?.reports || [])).catch(() => setList([]))
  }, [])

  const getPdf = async (r, download) => {
    const key = r._id + (download ? 'd' : 'v')
    setBusy(key)
    // Open the tab now (pop-up blockers allow it only straight after a click).
    const w = download ? null : window.open('', '_blank')
    try {
      const res = await api.get('/reports/' + r._id + '/pdf', { responseType: 'blob', params: download ? { download: 1 } : {} })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      if (download) {
        const a = document.createElement('a')
        a.href = url; a.download = `Smartious-Report-Term-${r.term}-${String(r.academicYear || '').replace('/', '-')}.pdf`
        document.body.appendChild(a); a.click(); a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      } else if (w) w.location.href = url
    } catch {
      w?.close()
      toast?.error?.('Could not open the report. Please try again.')
    } finally { setBusy('') }
  }

  if (list === null) return null
  return (
    <section style={{ background: C.parchment, border: `1px solid ${C.line}`, borderRadius: 14, padding: '16px 18px', margin: '0 0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: list.length ? 12 : 4 }}>
        <h2 style={{ margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 18, color: C.crimson, letterSpacing: '.04em' }}>Report cards</h2>
        <span style={{ fontSize: 12.5, color: C.sepia }}>Your official end-of-term reports</span>
      </div>
      {!list.length ? (
        <p style={{ margin: 0, fontSize: 13.5, color: C.sepia }}>Your term report will appear here when the school publishes it.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {list.map(r => (
            <div key={r._id} style={{ background: '#FFFDF7', border: `1px solid ${C.line}`, borderRadius: 12, padding: '12px 14px', boxShadow: 'inset 0 0 0 3px #FFFDF7, inset 0 0 0 4px ' + C.line }}>
              <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 16, fontWeight: 700, color: C.ink }}>{r.termLabel || 'Term ' + r.term}</div>
              <div style={{ fontSize: 12.5, color: C.sepia, marginBottom: 8 }}>Academic year {r.academicYear}{r.dateIssued ? ' · issued ' + fmt(r.dateIssued) : ''}</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <div><div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: C.sepia }}>Average</div><div style={{ fontSize: 20, fontWeight: 800, color: C.crimson }}>{r.overallAverage != null ? r.overallAverage + '%' : '—'}</div></div>
                <div><div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: C.sepia }}>Grade</div><div style={{ fontSize: 20, fontWeight: 800, color: C.crimson }}>{r.meanGrade || '—'}</div></div>
                <div><div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: C.sepia }}>Subjects</div><div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{(r.subjects || []).length}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => getPdf(r, false)} disabled={!!busy}
                  style={{ flex: 1, border: `1px solid ${C.crimson}`, background: '#fff', color: C.crimson, borderRadius: 8, padding: '8px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {busy === r._id + 'v' ? 'Opening…' : 'View'}
                </button>
                <button type="button" onClick={() => getPdf(r, true)} disabled={!!busy}
                  style={{ flex: 1, border: 'none', background: C.crimson, color: '#fff', borderRadius: 8, padding: '8px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {busy === r._id + 'd' ? 'Preparing…' : 'Download PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
