/**
 * Coach — what an examiner would look for in the table, graph and working.
 * Formative only: it never changes marks.
 */
import { useMemo } from 'react'
import { checkAnalysis } from '../core.js'

export default function Coach({ analysis, minRows, compact = false, only = null }) {
  const checks = useMemo(() => checkAnalysis(analysis, { minRows }).filter(c => !only || c.area === only), [analysis, minRows, only])
  const areas = [...new Set(checks.map(c => c.area))]
  const todo = checks.filter(c => !c.ok).length
  return (
    <div className={'lab-coach' + (compact ? ' compact' : '')}>
      <h3>Lab coach <span className={'lab-coach-n ' + (todo ? 'todo' : 'ok')}>{todo ? todo + ' to improve' : 'all good'}</span></h3>
      <p className="lab-help">What an examiner looks for in your table, graph and working. These tips do not change your marks.</p>
      {areas.map(a => (
        <div key={a}>
          <h4>{a}</h4>
          <ul>{checks.filter(c => c.area === a).map((c, i) => <li key={i} className={c.ok ? 'ok' : 'todo'}><span aria-hidden="true">{c.ok ? '✓' : '!'}</span> <span className="sr-only">{c.ok ? 'Done: ' : 'To do: '}</span>{c.text}</li>)}</ul>
        </div>
      ))}
    </div>
  )
}
