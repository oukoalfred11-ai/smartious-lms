// Quick check of one or more chapter files while writing practicals:
//   node test/checkChapter.mjs experiments/physics-al/ch05.js [...]
// Validates each definition and plays it as a careful student on 6 seeds,
// on the original bench and on the hands-on bench (bench: 2).
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { replay, gradeSession, validateDefinition } from '../engine.js'
import { APPARATUS } from '../apparatus.js'
import { carefulRun } from './careful.js'

let failed = 0
for (const f of process.argv.slice(2)) {
  const mod = await import(pathToFileURL(path.resolve(f)).href)
  for (const def of mod.default) {
    const problems = validateDefinition(def)
    for (const a of def.apparatus) if (!APPARATUS[a]) problems.push('unknown apparatus ' + a)
    for (const r of [...def.practical.constants, ...def.practical.measures]) if (r.instrument && !def.apparatus.includes(r.instrument)) problems.push(r.key + ' uses ' + r.instrument + ', not in apparatus')
    const marks = []
    for (const seed of ['s1', 's2', 's3', 's4', 's5', 's6', 'h:s1', 'h:s2', 'h:s3', 'h:s4', 'h:s5', 'h:s6']) {
      try {
        const { params, state, actions, answers } = carefulRun(def, seed, { options: seed.startsWith('h:') ? { bench: 2 } : {} })
        JSON.stringify(replay(def, params, actions)) === JSON.stringify(state) || problems.push(seed + ': replay differs')
        const g = gradeSession(def, { params, state, answers })
        for (const row of g.rows.filter(r => r.auto && r.marks < r.max)) problems.push(`${seed}: ${row.label}: ${row.marks}/${row.max} — ${row.detail}`)
        const e = def.expected({ params, state, answers })
        marks.push(Object.entries(e).map(([k, v]) => k + '=' + v).join(' '))
      } catch (err) { problems.push(seed + ': ' + err.message) }
    }
    if (problems.length) { failed++; console.log('FAIL', def.id, def.title); problems.forEach(p => console.log('   ', p)) }
    else console.log('ok  ', def.id, def.title, '|', marks[0])
  }
}
process.exit(failed ? 1 : 0)
