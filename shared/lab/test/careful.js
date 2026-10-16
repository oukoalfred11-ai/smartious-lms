// A careful student: collects the right apparatus, reads every instrument,
// records exactly what is shown, covers the range, repeats, chooses the
// right axes and answers from the graph.
import { paramsFor, applyAction } from '../engine.js'

export function carefulRun(def, seed, { points = 8, options = {} } = {}) {
  const P = def.practical
  const params = paramsFor(def, seed, options)
  const actions = []
  let state = def.initialState(params)
  const step = (type, payload = {}) => { actions.push({ type, payload }); state = applyAction(def, params, state, { type, payload }) }
  if (state.collected == null) step('collect', { items: P.required })
  if (P.circuit) {
    for (const [a, b] of P.circuit.correct) step('connect', { a, b })
    if (P.circuit.parts.some(p => p.type === 'switch')) step('toggleSwitch')
  }
  for (const c of P.constants) { step('measure', { key: c.key }); step('recordConst', { key: c.key, value: state.readings[c.key] }) }
  const seriesSetting = P.seriesBy ? P.settings.find(s => s.key === P.seriesBy) : null
  const settingValues = seriesSetting ? seriesSetting.options.map(o => o.value) : [null]
  for (const sv of settingValues) {
    if (seriesSetting) step('setting', { key: seriesSetting.key, value: sv })
    if (P.measures.length) {
      const xs = P.iv ? [...new Set(Array.from({ length: points }, (_, i) => {
        const raw = P.iv.min + (P.iv.max - P.iv.min) * i / (points - 1)
        return Number((Math.round((raw - P.iv.min) / P.iv.step) * P.iv.step + P.iv.min).toFixed(6))
      }))] : [null]
      for (const x of xs) {
        if (P.iv) {
          if (P.iv.monotonic && state.rows.length && x < state.x) continue
          step('setIV', { value: x })
        }
        for (let r = 0; r < P.repeats; r++) {
          const values = {}
          for (const m of P.measures) { step('measure', { key: m.key }); values[m.key] = state.readings[m.key] }
          step('recordRow', { values })
        }
      }
    }
  }
  if (def.correctGraph) step('setGraph', def.correctGraph)
  const answers = {}
  const exp = def.expected({ params, state, answers })
  for (const q of def.questions) if (q.id.startsWith('r_')) answers[q.id] = String(exp[q.id])
  for (const [id, c] of Object.entries(P.choiceAnswers)) answers[id] = String(c)
  return { params, state, actions, answers }
}

