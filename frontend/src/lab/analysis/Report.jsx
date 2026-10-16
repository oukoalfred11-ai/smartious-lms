/**
 * Report — the student's formal laboratory report, assembled from their
 * plan, notebook, results table, graphs, working and answers. The same
 * component is shown to the teacher. "Print or save as PDF" prints only the
 * report (see .lab-report in lab.css).
 */
import { useMemo } from 'react'
import { computeTable, computeCalcs, graphResults, graphPoints, headingOf } from '../core.js'
import { apparatusName } from '../../../../shared/lab/apparatus.js'
import GraphCanvas from './GraphCanvas.jsx'
import { DataTables } from '../panels.jsx'

const sig = (v, n = 3) => (v == null || !Number.isFinite(v) ? '—' : Number(v.toPrecision(n)).toString())
const Para = ({ text, empty = 'Not written yet.' }) => (String(text || '').trim() ? <p className="lab-rep-text">{text}</p> : <p className="lab-rep-empty">{empty}</p>)

export default function Report({ def, session, notebook = {}, answers = {}, analysis, benchTables = [], studentName }) {
  const t = useMemo(() => computeTable(analysis.table), [analysis.table])
  const calcs = useMemo(() => computeCalcs(analysis), [analysis])
  const nb = (k) => notebook[k]
  const when = session?.submittedAt || session?.updatedAt
  const qs = def.questions.filter(q => !/^plan_/.test(q.id))
  const plan = def.questions.filter(q => /^plan_/.test(q.id))
  const ans = (q) => (q.type === 'choice' ? q.options[Number(answers[q.id])] : answers[q.id])
  let fig = 0

  return (
    <article className="lab-report" aria-label="Laboratory report">
      <header className="lab-rep-head">
        <p className="lab-rep-kicker">Smartious Virtual Science Laboratory · Laboratory report</p>
        <h1>{def.title}</h1>
        <p>{studentName || session?.studentName || ''}{when ? ' · ' + new Date(when).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}{session?.attempt ? ' · attempt ' + session.attempt : ''}</p>
        <p className="lab-rep-sim">Readings in this report come from a computer simulation of the experiment, not from real apparatus.</p>
      </header>

      <section><h2>1. Aim</h2><Para text={nb('aim')} empty={def.notebook.aim} /></section>
      <section><h2>2. Hypothesis</h2><Para text={nb('hypothesis')} /></section>
      <section><h2>3. Variables</h2><Para text={nb('variables')} /></section>
      {plan.length > 0 && <section><h2>Plan</h2>{plan.map(q => <div key={q.id}><h3>{q.prompt.replace(/^Plan:\s*/, '')}</h3><Para text={ans(q)} /></div>)}</section>}
      <section><h2>4. Risk assessment</h2><Para text={nb('risk')} empty="No risk assessment written." />
        <details className="lab-rep-ref"><summary>Safety notes given</summary><ul>{def.safety.map(s => <li key={s}>{s}</li>)}</ul></details></section>
      <section><h2>5. Apparatus</h2>{String(nb('apparatus') || '').trim() ? <Para text={nb('apparatus')} /> : <ul className="lab-rep-cols">{def.apparatus.map(a => <li key={a}>{String(apparatusName(a) || a).replace(/_/g, ' ')}</li>)}</ul>}</section>
      <section><h2>6. Method</h2>{String(nb('procedure') || '').trim() ? <Para text={nb('procedure')} /> : <ol>{def.procedure.map(p => <li key={p}>{p}</li>)}</ol>}</section>

      <section>
        <h2>7. Results</h2>
        {t.columns.length ? (
          <figure>
            <table className="lab-table lab-rep-table">
              <thead><tr>{t.columns.map(c => <th key={c.id}>{headingOf(c) || '—'}</th>)}</tr></thead>
              <tbody>{t.cells.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k}>{c.text || ''}</td>)}</tr>)}</tbody>
            </table>
            <figcaption>Table 1. Results{t.columns.some(c => c.kind === 'calc') ? '; calculated columns: ' + t.columns.filter(c => c.kind === 'calc').map(c => `${c.name || '?'} = ${c.formula}`).join(', ') : ''}.</figcaption>
          </figure>
        ) : (
          <><p className="lab-rep-empty">No results table drawn up. Bench record:</p><DataTables tables={benchTables} /></>
        )}
        {String(nb('observations') || '').trim() && <><h3>Observations</h3><Para text={nb('observations')} /></>}
      </section>

      <section>
        <h2>8. Graphs</h2>
        {(analysis.graphs || []).length === 0 && <p className="lab-rep-empty">No graph plotted.</p>}
        {(analysis.graphs || []).map((g) => {
          fig += 1
          const r = graphResults(g, graphPoints(analysis, g))
          return (
            <figure key={g.id} className="lab-rep-fig">
              <GraphCanvas analysis={analysis} graph={g} id={'rep-' + g.id} />
              <figcaption>Figure {fig}. {g.title || 'Graph'}{r.best ? `. Line of best fit: gradient ${sig(r.best.gradient)}, y-intercept ${sig(r.best.intercept)}` : ''}{r.worst ? `; worst acceptable line: gradient ${sig(r.worst.gradient)}` : ''}{r.triangle ? `; triangle Δy/Δx = ${sig(r.triangle.dy)}/${sig(r.triangle.dx)}` : ''}{g.showComputer ? '. The computer’s line was shown as a check' : ''}.</figcaption>
            </figure>
          )
        })}
      </section>

      <section>
        <h2>9. Analysis</h2>
        {calcs.length > 0 && <ol className="lab-rep-calcs">{calcs.map((c, i) => <li key={i}>{c.label ? c.label + ': ' : ''}{c.name ? <i>{c.name}</i> : null}{c.name ? ' = ' : ''}{c.expr || '—'} = <b>{c.text || '—'}</b> {c.unit}{c.error ? <span className="lab-problems"> ({c.error})</span> : null}</li>)}</ol>}
        <Para text={nb('analysis')} empty={calcs.length ? '' : 'No analysis written.'} />
        {qs.filter(q => q.id !== 'evaluation').length > 0 && (
          <dl className="lab-rep-qs">{qs.filter(q => q.id !== 'evaluation').map(q => <div key={q.id}><dt>{q.prompt}{q.unit ? ` (${q.unit})` : ''}</dt><dd>{ans(q) || <span className="lab-rep-empty">Not answered.</span>}</dd></div>)}</dl>
        )}
      </section>
      <section><h2>10. Conclusion</h2><Para text={nb('conclusion')} /></section>
      <section><h2>11. Evaluation</h2><Para text={nb('evaluation')} />{answers.evaluation && answers.evaluation !== nb('evaluation') && <Para text={answers.evaluation} />}</section>
    </article>
  )
}
