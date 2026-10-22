/**
 * benchGuide.js — the instruction and progress shown in the 3D bench's
 * step panel (the "what to do next" a teacher would say), for every kind
 * of experiment. Never reveals a hidden value.
 */
import { titrationNext, osmosisNext } from './handsOnChemControls.jsx'
import { oneClickTitration, oneClickOsmosis } from './benchMode.js'

const clamp01 = (v) => Math.max(0, Math.min(1, v))

/** Next step on a measurement practical (physics bench). */
function practicalNext(def, v) {
  const P = def.practical || {}
  const H = v.hands
  if (!v.collected) return 'Collect the apparatus you need from the stockroom.'
  if (H) {
    if (H.tidy) return 'Your bench is tidied away. Go on to your results table.'
    if (H.needsGoggles && !H.goggles) return 'Put on your safety goggles before you load or stretch anything.'
    const untared = (H.tareInstruments || []).find(id => (H.balanceZero || {})[id]?.value !== 0)
    if (untared) return 'Press TARE on the balance with the pan empty.'
    if (H.timer?.running) return 'Watch the oscillations and stop the stopwatch after a whole number of them.'
    if (!H.settled) return 'Wait for the readings to settle before you read them.'
  }
  const rows = (v.rows || []).length
  const need = P.minPoints || 5
  if (rows < need) return `Set ${P.iv?.label?.toLowerCase() || 'the variable'} to a new value and take your readings (click an instrument). ${rows} of at least ${need} sets recorded.`
  return 'You have enough readings. Switch off, tidy away and go on to your results table.'
}

/** { text, progress 0..1 } for the experiment part. */
export function benchGuide(def, view) {
  if (!def || !view) return null
  if (def.id === 'chem-titration') {
    if (oneClickTitration(view)) return null
    const c = view.titres?.concordant?.length || 0
    const runs = (view.runs || []).filter(r => r.final != null).length
    return { text: titrationNext(view), progress: clamp01(c >= 2 ? 1 : (runs + c) / 4 + (view.burette?.filled ? 0.1 : 0)) }
  }
  if (def.id === 'bio-osmosis') {
    if (oneClickOsmosis(view)) return null
    const t = view.tubes || []
    const done = t.filter(x => x.m0 != null).length + t.filter(x => x.m1 != null).length
    return { text: osmosisNext(view), progress: clamp01(done / 12) }
  }
  if (def.practical) {
    const need = def.practical.minPoints || 5
    return { text: practicalNext(def, view), progress: clamp01((view.rows || []).length / need) }
  }
  if (def.id === 'phys-ohms-law') {
    const rows = (view.rows || []).length
    const text = view.fault ? 'Something is wrong with the circuit: check the leads.' : !(view.wires || []).length ? 'Build the circuit: drag leads between the terminals.' : rows < 6 ? 'Set the supply, close the switch and record the current and the voltage.' : 'You have enough readings. Open the switch and go on to your results table.'
    return { text, progress: clamp01(rows / 6) }
  }
  return null
}
