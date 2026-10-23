/**
 * StatReport.jsx — click any headline number to read the report behind it.
 *
 *   const report = useStatReport(toast)
 *   <ClickStat onOpen={() => report.open({ key: 'attendance', params: { days: 7 } })}>…card…</ClickStat>
 *   {report.modal}
 *
 * A spec is either { key, params } for /api/stat-reports/:key, or
 * { load: async () => report } for a report built from an existing endpoint.
 * The report: { title, window, value, summary, method, columns, rows }.
 * Every report can be searched, sorted, downloaded as CSV and printed.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from './tokens.js'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi' }) : '')
const fmtDT = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }) : '')
function cell(v, type) {
  if (v === null || v === undefined || v === '') return '—'
  if (type === 'date') return fmtDate(v)
  if (type === 'datetime') return fmtDT(v)
  if (type === 'pct') return v + '%'
  if (type === 'money') return Number(v).toLocaleString('en-KE', { maximumFractionDigits: 0 })
  return String(v)
}
const sortVal = (v, type) => (v === null || v === undefined || v === '' ? null : type === 'date' || type === 'datetime' ? new Date(v).getTime() : typeof v === 'number' ? v : String(v).toLowerCase())
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function useStatReport(toast) {
  const [spec, setSpec] = useState(null)
  return { open: setSpec, modal: spec ? <StatReportModal spec={spec} toast={toast} onClose={() => setSpec(null)} /> : null }
}

// A stat card that opens its report: keyboard and mouse, with a hint.
export function ClickStat({ onOpen, children, style }) {
  const [hover, setHover] = useState(false)
  return (
    <div role="button" tabIndex={0} title="Open the report behind this number"
      onClick={onOpen} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', position: 'relative', borderRadius: 12, transition: 'transform .12s, box-shadow .12s',
        transform: hover ? 'translateY(-1px)' : 'none', boxShadow: hover ? '0 6px 18px rgba(125,16,37,.12)' : 'none', ...style }}>
      {children}
      <span style={{ position: 'absolute', right: 10, bottom: 7, fontSize: 10.5, fontWeight: 800, color: TOKENS.crimson, opacity: hover ? 1 : 0.55 }}>Report ›</span>
    </div>
  )
}

function StatReportModal({ spec, toast, onClose }) {
  const [rep, setRep] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState(null) // { key, dir }

  useEffect(() => {
    let live = true
    const p = spec.load ? spec.load() : api.get('/stat-reports/' + spec.key, { params: spec.params || {} }).then(r => r.data?.data)
    p.then(d => { if (live) setRep(d) }).catch(e => { if (live) setErr(e?.response?.data?.message || 'Could not load the report.') })
    return () => { live = false }
  }, [spec])
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const rows = useMemo(() => {
    if (!rep) return []
    const needle = q.trim().toLowerCase()
    let out = needle ? rep.rows.filter(r => rep.columns.some(c => String(cell(r[c.key], c.type)).toLowerCase().includes(needle))) : rep.rows
    if (sort) {
      const type = rep.columns.find(c => c.key === sort.key)?.type
      out = [...out].sort((a, b) => {
        const x = sortVal(a[sort.key], type), y = sortVal(b[sort.key], type)
        if (x === null) return 1
        if (y === null) return -1
        return (x > y ? 1 : x < y ? -1 : 0) * sort.dir
      })
    }
    return out
  }, [rep, q, sort])

  const windowText = rep?.window ? `${fmtDate(rep.window.from)} – ${fmtDate(rep.window.to)}` : ''
  const csv = () => {
    const e = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
    const text = [rep.columns.map(c => e(c.label)).join(',')].concat(rows.map(r => rep.columns.map(c => e(cell(r[c.key], c.type))).join(','))).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }))
    a.download = (rep.title || 'report').replace(/[^A-Za-z0-9]+/g, '-') + '.csv'
    a.click(); URL.revokeObjectURL(a.href)
  }
  const print = () => {
    const w = window.open('', '_blank')
    if (!w) return toast?.error?.('Allow pop-ups to print the report.')
    w.document.write(`<!doctype html><html><head><title>${esc(rep.title)}</title><style>
      body{font-family:Georgia,serif;color:#1a1a1a;margin:32px;line-height:1.45}h1{font-size:21px;margin:0;color:#7D1025}
      .sub{color:#666;font-size:11.5px;margin:2px 0 12px}.k{display:flex;gap:22px;flex-wrap:wrap;margin:10px 0}.k b{display:block;font-size:17px}
      table{width:100%;border-collapse:collapse;font-size:10.5px}th{text-align:left;background:#F7F2EA;padding:5px 7px;border:1px solid #ddd}
      td{padding:4px 7px;border:1px solid #ddd}.m{font-size:9.5px;color:#666;margin-top:12px;border-top:1px solid #ddd;padding-top:6px}
      @media print{body{margin:12px}}</style></head><body>
      <h1>${esc(rep.title)}: ${esc(rep.value)}</h1>
      <div class="sub">${esc(windowText)}${windowText ? ' · ' : ''}generated ${esc(fmtDT(rep.generatedAt || new Date()))}${q ? ' · filtered: ' + esc(q) : ''}</div>
      <div class="k">${(rep.summary || []).map(([l, v]) => `<div><b>${esc(v)}</b>${esc(l)}</div>`).join('')}</div>
      <table><thead><tr>${rep.columns.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>
      ${rows.map(r => '<tr>' + rep.columns.map(c => `<td>${esc(cell(r[c.key], c.type))}</td>`).join('') + '</tr>').join('')}</tbody></table>
      <div class="m"><b>Method.</b> ${esc(rep.method)} Smartious Homeschool · Est. 2018 · smartioushomeschool.com</div>
      <script>window.onload = () => window.print()</` + `script></body></html>`)
    w.document.close()
  }

  const btn = (primary) => ({ border: primary ? 'none' : `1px solid ${TOKENS.line}`, background: primary ? TOKENS.crimson : '#fff', color: primary ? '#fff' : TOKENS.s900, borderRadius: 8, padding: '7px 12px', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' })
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,10,.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4vh 12px', overflow: 'auto' }}>
      <div role="dialog" aria-modal="true" aria-label={rep?.title || 'Report'} onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, width: 'min(1100px, 100%)', boxShadow: '0 20px 60px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: TOKENS.s400, textTransform: 'uppercase', letterSpacing: '.08em' }}>Report</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: TOKENS.s900 }}>{rep?.title || spec.title || 'Loading…'}{rep ? <span style={{ color: TOKENS.crimson }}> · {rep.value}</span> : null}</div>
            {windowText && <div style={{ fontSize: 12, color: TOKENS.s500 }}>{windowText}</div>}
          </div>
          {rep && <><button type="button" onClick={csv} style={btn(false)}>Download CSV</button><button type="button" onClick={print} style={btn(true)}>Print</button></>}
          <button type="button" onClick={onClose} aria-label="Close" style={{ ...btn(false), padding: '7px 11px' }}>✕</button>
        </div>

        {err ? <div style={{ padding: 20, color: '#991B1B' }}>{err}</div> : !rep ? <div style={{ padding: 30, color: TOKENS.s500 }}>Building the report…</div> : (
          <>
            <div style={{ padding: '12px 20px', display: 'flex', gap: 10, flexWrap: 'wrap', borderBottom: `1px solid ${TOKENS.line}` }}>
              {(rep.summary || []).map(([l, v]) => (
                <div key={l} style={{ background: '#FBF8F2', border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: '8px 12px', minWidth: 110 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: TOKENS.s900 }}>{v}</div>
                  <div style={{ fontSize: 11, color: TOKENS.s500, fontWeight: 700 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 20px', fontSize: 12, color: TOKENS.s500, lineHeight: 1.55 }}><b style={{ color: TOKENS.s700 }}>How this is counted.</b> {rep.method}</div>
            <div style={{ padding: '0 20px 10px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search this report" style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, width: 240, fontFamily: 'inherit' }} />
              <span style={{ fontSize: 12, color: TOKENS.s500 }}>{rows.length} of {rep.rows.length} rows · click a column to sort</span>
            </div>
            <div style={{ overflow: 'auto', padding: '0 20px 18px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead><tr>
                  {rep.columns.map(c => (
                    <th key={c.key} onClick={() => setSort(s => ({ key: c.key, dir: s?.key === c.key ? -s.dir : 1 }))}
                      style={{ position: 'sticky', top: 0, background: '#F7F2EA', textAlign: ['num', 'pct', 'money'].includes(c.type) ? 'right' : 'left', padding: '7px 8px', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em', color: TOKENS.crimson, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {c.label}{sort?.key === c.key ? (sort.dir > 0 ? ' ▲' : ' ▼') : ''}
                    </th>
                  ))}
                </tr></thead>
                <tbody>
                  {rows.slice(0, 1500).map((r, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${TOKENS.line}` }}>
                      {rep.columns.map(c => (
                        <td key={c.key} style={{ padding: '6px 8px', textAlign: ['num', 'pct', 'money'].includes(c.type) ? 'right' : 'left', verticalAlign: 'top', maxWidth: 360 }}>{cell(r[c.key], c.type)}</td>
                      ))}
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan={rep.columns.length} style={{ padding: 14, color: TOKENS.s500 }}>Nothing to show.</td></tr>}
                </tbody>
              </table>
              {rows.length > 1500 && <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 6 }}>Showing the first 1,500 rows. Download the CSV for all {rows.length}.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Reports built from existing endpoints (same numbers as the cards that use them).
export const CLIENT_REPORTS = {
  churn: () => api.get('/ops-reports/churn').then(r => {
    const d = r.data?.data || {}
    return {
      title: 'Families at leaving risk', value: d.high ?? 0, method: d.method || '',
      summary: [['High risk', d.high ?? 0], ['On watch', d.watch ?? 0]],
      columns: [{ key: 'name', label: 'Student' }, { key: 'grade', label: 'Grade' }, { key: 'curriculum', label: 'Curriculum' }, { key: 'risk', label: 'Risk' }, { key: 'score', label: 'Score', type: 'num' }, { key: 'attendanceRecentPct', label: 'Attendance 14d', type: 'pct' }, { key: 'parentGapDays', label: 'Parent inactive (days)', type: 'num' }, { key: 'why', label: 'Signals' }],
      rows: (d.rows || []).map(x => ({ ...x, why: (x.signals || []).join('; ') })),
    }
  }),
  aging: () => api.get('/ops-reports/revenue').then(r => {
    const d = r.data?.data || {}
    return {
      title: 'Unpaid invoices by age', value: Number(d.outstandingTotal || 0).toLocaleString('en-KE'), method: d.method || '',
      summary: [['Issued this month', Number(d.issued || 0).toLocaleString('en-KE')], ['Collected', Number(d.collected || 0).toLocaleString('en-KE')], ['Collection rate', d.collectionPct != null ? d.collectionPct + '%' : '—']],
      columns: [{ key: 'bucket', label: 'Age' }, { key: 'n', label: 'Invoices', type: 'num' }, { key: 'amount', label: 'Amount', type: 'money' }],
      rows: d.aging || [],
    }
  }),
}
