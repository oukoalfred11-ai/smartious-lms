// A careful student: collects the right apparatus, reads every instrument,
// records exactly what is shown, covers the range, repeats, chooses the
// right axes and answers from the graph.
//
// On the hands-on bench (options.bench = 2) the careful student also puts
// on goggles where needed, looks square-on at scales, tares the balance,
// checks and records the micrometer's zero error, adds masses one at a
// time, closes the switch only for each reading and lets the meters
// settle, starts and stops the stopwatch (resetting it first), and
// switches off and tidies away at the end.
import { paramsFor, applyAction, viewOf } from '../engine.js'

export function carefulRun(def, seed, { points = 8, options = {} } = {}) {
  const P = def.practical
  const params = paramsFor(def, seed, options)
  const actions = []
  let state = def.initialState(params)
  const step = (type, payload = {}) => { actions.push({ type, payload }); state = applyAction(def, params, state, { type, payload }) }
  const hands = !!state.hands
  const H = () => viewOf(def, params, state).hands
  const hasSwitch = !!P.circuit?.parts.some(p => p.type === 'switch')
  if (state.collected == null) step('collect', { items: P.required })
  if (P.circuit) {
    for (const [a, b] of P.circuit.correct) step('connect', { a, b })
    if (hasSwitch && !hands) step('toggleSwitch')
  }
  if (hands) {
    const h = H()
    if (h.needsGoggles) step('wearGoggles')
    step('setEye', { offset: 0 })
    for (const id of h.tareInstruments) step('tare', { instrument: id })
    for (const id of h.zeroInstruments) { step('zeroCheck', { instrument: id }); step('recordZero', { instrument: id, value: state.hands.zeroShown[id] }) }
  }
  for (const c of P.constants) { step('measure', { key: c.key }); step('recordConst', { key: c.key, value: state.readings[c.key] }) }
  const seriesSetting = P.seriesBy ? P.settings.find(s => s.key === P.seriesBy) : null
  const settingValues = seriesSetting ? seriesSetting.options.map(o => o.value) : [null]
  const goTo = (x) => {
    if (hands && P.iv.instrument === 'slotted_masses') {
      while (Math.abs(state.x - x) > 1e-9) step('setIV', { value: state.x + Math.sign(x - state.x) * P.iv.step })
    } else step('setIV', { value: x })
  }
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
          goTo(x)
        }
        for (let r = 0; r < P.repeats; r++) {
          if (hands && hasSwitch) step('toggleSwitch')
          if (hands && !state.hands.settled) step('wait')
          const values = {}
          for (const m of P.measures) {
            if (hands && m.instrument === 'stopwatch') {
              if (state.hands.timer.acc) step('resetTimer')
              step('startTimer')
            }
            step('measure', { key: m.key }); values[m.key] = state.readings[m.key]
          }
          step('recordRow', { values })
          if (hands && hasSwitch) step('toggleSwitch')
        }
      }
    }
  }
  if (def.correctGraph) step('setGraph', def.correctGraph)
  if (hands) {
    if (hasSwitch && state.switchClosed) step('toggleSwitch')
    step('tidyUp')
  }
  const answers = {}
  const exp = def.expected({ params, state, answers })
  for (const q of def.questions) if (q.id.startsWith('r_')) answers[q.id] = String(exp[q.id])
  for (const [id, c] of Object.entries(P.choiceAnswers)) answers[id] = String(c)
  return { params, state, actions, answers }
}
