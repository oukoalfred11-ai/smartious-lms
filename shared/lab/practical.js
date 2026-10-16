/**
 * practical.js — builds a full experiment definition from a short
 * measurement-practical specification.
 *
 * Most school physics practicals have the same shape: collect the
 * apparatus, take some one-off measurements (a diameter, a mass), vary one
 * quantity, read the instruments (repeating where needed), tabulate, choose
 * the axes that give a straight line, find the gradient or intercept and
 * deduce a physical quantity. definePractical() turns a specification of
 * that shape into a definition the engine, grader, server, PDF report and
 * the generic bench UI all understand.
 *
 * Specification (all text is Smartious's own wording):
 * {
 *   id, collection: { id, name, code, chapter }, title, summary, aim, topic,
 *   durationMin, difficulty, skills[], objectives[], safety[], procedure[], controlled,
 *   apparatus: [ids from apparatus.js], distractors?: [ids],
 *   model: { kind: 'quantitative'|'simplified', summary, assumptions[] },
 *   hidden: (q) => params            q(name, lo, hi) seeded uniform, q.pick(name, list)
 *   settings?: [{ key, label, options: [{ value, label }], default }]   extra controls (e.g. lid on/off)
 *   constants?: [{ key, label, symbol, unit, resolution, instrument, read: (p, n, s) => value }]
 *   iv?: { key, label, symbol, unit, min, max, step, start, instrument, monotonic? }
 *   measures: [{ key, label, symbol, unit, resolution, instrument, read: (p, x, n, s) => value }]
 *   repeats?: 1 | 2 | 3                minimum readings at each value of the independent variable
 *   derived?: [{ key, label, symbol, unit, decimals, value: (row, c, s) => number }]
 *   graph?: { x, tx, y, ty, fit: 'line'|'origin', seriesBy?, title }   the correct axes
 *   results: [{ id, prompt, unit, sig, fromFit?: (fit, c) => v, fromConsts?: (c, groups) => v,
 *               series?, truth: (p) => v, tolOwn?: {rel|abs}, tolTrue?: {rel|abs} }]
 *   questions?: [{ id, type, prompt, options?, correct? }]   choice questions with `correct` are auto-marked
 *   planning?: true                    adds planning prompts and a teacher-marked planning row
 *   minPoints?: 5, minSpanFrac?: 0.5
 * }
 *
 * The read functions are the physics. n(sd) returns a normally distributed
 * error (seeded, so a reload gives the same readings); n.u(lo, hi) is uniform.
 */
import { rng, hashSeed, seeded, pick } from './science/random.js'
import { toResolution, toSigFigs, linearFit, fitThroughOrigin, within, mean } from './science/numeric.js'
import { APPARATUS, apparatusName } from './apparatus.js'

class PracticalError extends Error { constructor(m) { super(m); this.name = 'LabActionError' } }
const fail = (m) => { throw new PracticalError(m) }

export const TRANSFORMS = {
  none: { label: 'x', f: (x) => x },
  square: { label: 'x²', f: (x) => x * x },
  sqrt: { label: '√x', f: (x) => (x >= 0 ? Math.sqrt(x) : NaN) },
  reciprocal: { label: '1/x', f: (x) => (x !== 0 ? 1 / x : NaN) },
  ln: { label: 'ln x', f: (x) => (x > 0 ? Math.log(x) : NaN) },
  lg: { label: 'lg x', f: (x) => (x > 0 ? Math.log10(x) : NaN) },
}
const wrap = (u) => (/[ ·/]/.test(u) ? '(' + u + ')' : u)
export function axisLabel(v, tf = 'none') {
  const s = v.symbol || v.label, u = v.unit || ''
  switch (tf) {
    case 'square': return `${s}² / ${u ? wrap(u) + '²' : '—'}`
    case 'sqrt': return `√${s} / ${u ? wrap(u) + '^½' : '—'}`
    case 'reciprocal': return `1/${s} / ${u ? wrap(u) + '⁻¹' : '—'}`
    case 'ln': return `ln(${s}${u ? ' / ' + u : ''})`
    case 'lg': return `lg(${s}${u ? ' / ' + u : ''})`
    default: return u ? `${s} / ${u}` : s
  }
}

function noiseFor(seed, key, counter) {
  const r = rng(hashSeed(seed + '|noise|' + key + '|' + counter))
  const n = (sd = 1) => {
    let u = 0
    while (u === 0) u = r()
    return sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
  }
  n.u = (lo, hi) => lo + (hi - lo) * r()
  return n
}

const num = (v) => (v === '' || v == null ? NaN : Number(v))
const decimalsOf = (res) => Math.max(0, Math.ceil(-Math.log10(res) - 1e-9))
const fmtRes = (v, res) => (v == null || !Number.isFinite(v) ? '—' : v.toFixed(decimalsOf(res)))
const fmtNum = (v, d) => (v == null || !Number.isFinite(v) ? '—' : d != null ? v.toFixed(d) : String(toSigFigs(v, 4)))

export function definePractical(spec) {
  const constants = spec.constants || []
  const measures = spec.measures || []
  const derived = spec.derived || []
  const settings = spec.settings || []
  const iv = spec.iv || null
  const repeats = spec.repeats || 1
  const minPoints = spec.minPoints ?? 5
  const minSpanFrac = spec.minSpanFrac ?? 0.5
  const required = [...new Set(spec.apparatus)]
  for (const a of required) if (!APPARATUS[a]) throw new Error(spec.id + ': unknown apparatus ' + a)
  const distractors = (spec.distractors || pickDistractors(spec.id, required)).filter(a => APPARATUS[a] && !required.includes(a))
  const stockroom = shuffle(spec.id, [...required, ...distractors])
  const allReadings = [...constants.map(c => ({ ...c, kind: 'constant' })), ...measures.map(m => ({ ...m, kind: 'measure' }))]
  const byKey = Object.fromEntries(allReadings.map(r => [r.key, r]))
  const vars = [...(iv ? [{ key: iv.key, label: iv.label, symbol: iv.symbol, unit: iv.unit }] : []), ...measures, ...derived]
  const varByKey = Object.fromEntries(vars.map(v => [v.key, v]))
  const defaultSettings = Object.fromEntries(settings.map(s => [s.key, s.default ?? s.options[0].value]))
  const correctGraph = spec.graph ? { x: spec.graph.x, tx: spec.graph.tx || 'none', y: spec.graph.y, ty: spec.graph.ty || 'none' } : null

  // ── helpers over state ────────────────────────────────────
  const typedConsts = (s) => Object.fromEntries(constants.map(c => [c.key, num(s.constants[c.key])]))
  const settingsKey = (st) => JSON.stringify(settings.map(x => st?.[x.key] ?? defaultSettings[x.key]))
  function groups(s) {
    const map = new Map()
    for (const r of s.rows) {
      const k = (iv ? r.x : 0) + '|' + settingsKey(r.settings)
      if (!map.has(k)) map.set(k, { x: r.x, settings: { ...defaultSettings, ...r.settings }, rows: [] })
      map.get(k).rows.push(r)
    }
    const c = typedConsts(s)
    return [...map.values()].map(g => {
      const row = iv ? { [iv.key]: g.x } : {}
      for (const m of measures) { const vs = g.rows.map(r => num(r.values[m.key])).filter(Number.isFinite); row[m.key] = vs.length ? mean(vs) : NaN }
      for (const d of derived) { try { row[d.key] = d.value(row, c, g.settings) } catch { row[d.key] = NaN } }
      return { ...g, row, n: g.rows.length }
    }).sort((a, b) => a.x - b.x)
  }
  function pointsFor(gs, choice) {
    const fx = TRANSFORMS[choice.tx]?.f || TRANSFORMS.none.f, fy = TRANSFORMS[choice.ty]?.f || TRANSFORMS.none.f
    return gs.map(g => ({ x: fx(g.row[choice.x]), y: fy(g.row[choice.y]), g })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
  }
  const fitOf = (pts, kind) => (pts.length >= 2 ? (kind === 'origin' ? (() => { const f = fitThroughOrigin(pts); return f ? { m: f.m, c: 0 } : null })() : linearFit(pts)) : null)
  function ownResult(res, s) {
    const c = typedConsts(s)
    const gs = groups(s)
    try {
      if (res.fromConsts) return res.fromConsts(c, gs)
      if (!correctGraph) return null
      const use = res.series != null && spec.graph.seriesBy ? gs.filter(g => String(g.settings[spec.graph.seriesBy]) === String(res.series)) : gs
      const fit = fitOf(pointsFor(use, correctGraph), spec.graph.fit)
      return fit ? res.fromFit(fit, c) : null
    } catch { return null }
  }

  const results = spec.results || []
  const questions = [
    ...results.map(r => ({ id: 'r_' + r.id, type: 'numeric', unit: r.unit, prompt: r.prompt, hint: (r.sig || 3) + ' significant figures.' })),
    ...(spec.questions || []).map(({ correct, ...q }) => q),
    ...(spec.planning ? [
      { id: 'plan_variables', type: 'text', prompt: 'Plan: identify the independent, dependent and control variables.' },
      { id: 'plan_method', type: 'text', prompt: 'Plan: describe your method, including how you will measure each quantity and how you will keep the control variables constant.' },
      { id: 'plan_analysis', type: 'text', prompt: 'Plan: state the graph you will plot and how you will use it to test the relationship.' },
      { id: 'plan_safety', type: 'text', prompt: 'Plan: identify a risk and how you will reduce it.' },
    ] : []),
    { id: 'evaluation', type: 'text', prompt: 'Identify two sources of uncertainty or limitations in this experiment and suggest an improvement for each.' },
  ]

  const rubric = [
    { id: 'apparatus', label: 'Correct apparatus collected', marks: 1, auto: ({ state }) => {
      const extra = (state.collected || []).filter(a => !required.includes(a) && a !== 'goggles')
      const ok = state.firstCollectComplete && extra.length <= 1
      return { marks: ok ? 1 : 0, detail: !state.collected ? 'No apparatus collected.' : !state.firstCollectComplete ? 'The first selection missed something needed.' : extra.length > 1 ? extra.length + ' unnecessary items collected.' : 'Apparatus chosen correctly.' }
    } },
    { id: 'readings', label: 'Readings recorded as shown on the instruments', marks: 1, auto: ({ state }) => {
      let bad = 0, total = 0
      for (const cst of constants) { total++; if (!within(num(state.constants[cst.key]), state.constShown[cst.key], { abs: cst.resolution * 0.51 })) bad++ }
      for (const r of state.rows) for (const m of measures) { total++; if (!within(num(r.values[m.key]), r.shown[m.key], { abs: m.resolution * 0.51 })) bad++ }
      return { marks: total && !bad ? 1 : 0, detail: !total ? 'No readings recorded.' : bad ? bad + ' of ' + total + ' readings differ from the instrument.' : 'All ' + total + ' readings match the instruments.' }
    } },
    ...(iv ? [{ id: 'range', label: 'Enough values over a suitable range', marks: 1, auto: ({ state }) => {
      const xs = [...new Set(state.rows.map(r => r.x))]
      const span = xs.length ? Math.max(...xs) - Math.min(...xs) : 0
      const ok = xs.length >= minPoints && span >= minSpanFrac * (iv.max - iv.min) - 1e-9
      return { marks: ok ? 1 : 0, detail: `${xs.length} different values of ${iv.symbol || iv.label} over a range of ${toSigFigs(span, 3)} ${iv.unit || ''} (needs at least ${minPoints} values over ${toSigFigs(minSpanFrac * (iv.max - iv.min), 3)} ${iv.unit || ''}).` }
    } }] : []),
    ...(iv && repeats > 1 ? [{ id: 'repeats', label: `Repeated readings (at least ${repeats} at each value)`, marks: 1, auto: ({ state }) => {
      const gs = groups(state)
      const ok = gs.length > 0 && gs.every(g => g.n >= repeats)
      return { marks: ok ? 1 : 0, detail: gs.length ? `${gs.filter(g => g.n >= repeats).length} of ${gs.length} values have ${repeats} or more readings.` : 'No readings.' }
    } }] : []),
    ...(correctGraph ? [{ id: 'graph', label: 'Suitable graph axes chosen', marks: 1, auto: ({ state }) => {
      const g = state.graph || {}
      const ok = g.x === correctGraph.x && (g.tx || 'none') === correctGraph.tx && g.y === correctGraph.y && (g.ty || 'none') === correctGraph.ty
      return { marks: ok ? 1 : 0, detail: 'Expected: ' + axisLabel(varByKey[correctGraph.y], correctGraph.ty) + ' against ' + axisLabel(varByKey[correctGraph.x], correctGraph.tx) + '.' }
    } }] : []),
    ...results.map(r => ({ id: 'res_' + r.id, label: r.prompt + ': method and accuracy', marks: 2, auto: (ctx) => {
      const a = num(ctx.answers['r_' + r.id])
      if (!Number.isFinite(a)) return { marks: 0, detail: 'No value given.' }
      const own = ownResult(r, ctx.state)
      const truth = r.truth(ctx.params)
      let m = 0
      if (own != null && Number.isFinite(own) && within(a, own, r.tolOwn || { rel: 0.02 })) m += 1
      if (within(a, truth, r.tolTrue || { rel: 0.1 })) m += 1
      return { marks: m, detail: `From your own data: ${own != null && Number.isFinite(own) ? toSigFigs(own, r.sig || 3) : '—'} ${r.unit || ''}. Model value: ${toSigFigs(truth, r.sig || 3)} ${r.unit || ''}.` }
    } })),
    ...(spec.questions || []).filter(q => q.type === 'choice' && q.correct != null).map(q => ({ id: 'q_' + q.id, label: q.prompt, marks: 1,
      auto: ({ answers }) => ({ marks: Number(answers[q.id]) === q.correct ? 1 : 0, detail: 'Correct answer: ' + q.options[q.correct] }) })),
    ...(spec.planning ? [{ id: 'plan', label: 'Plan: variables, method, analysis and safety', marks: 4, auto: null, guidance: 'Variables identified (1), workable method with control of variables (1), suitable graph and how it tests the relationship (1), a relevant risk and precaution (1).' }] : []),
    { id: 'report', label: 'Table, graph, working and evaluation', marks: 4, auto: null, guidance: spec.reportGuidance || 'Table headed with quantities and units, consistent precision (1); graph with labelled axes and a line of best fit (1); working shown for the result (1); two relevant sources of uncertainty with improvements (1).' },
  ]

  const def = {
    id: spec.id, version: spec.version || 1, subject: 'physics',
    title: spec.title, summary: spec.summary,
    collection: spec.collection || null,
    durationMin: spec.durationMin || 40, difficulty: spec.difficulty || 'AS',
    curriculum: spec.curriculum || [{ board: 'Cambridge', level: 'International AS & A Level', subject: 'Physics', topic: spec.topic || spec.title, syllabusRef: null, verified: false }],
    skills: spec.skills || ['Taking and recording readings', 'Plotting and analysing a graph', 'Evaluating uncertainty'],
    objectives: spec.objectives || [spec.aim],
    prerequisites: spec.prerequisites || [],
    safety: [...(spec.safety || []), 'This is a virtual practice using a computer model. It does not replace any practical work your examination board requires.'],
    apparatus: required, materials: spec.materials || [],
    procedure: spec.procedure,
    model: spec.model,
    notebook: {
      aim: spec.aim,
      variables: spec.variables || [iv ? 'Independent: ' + iv.label + '.' : '', measures.length ? 'Dependent: ' + measures.map(m => m.label.toLowerCase()).join(', ') + '.' : '', spec.controlled ? 'Controlled: ' + spec.controlled : ''].filter(Boolean).join(' '),
    },
    practical: {
      iv, constants, measures, derived, settings, repeats, stockroom, required, minPoints, minSpanFrac,
      vars: vars.map(({ key, label, symbol, unit }) => ({ key, label, symbol, unit })),
      choiceAnswers: Object.fromEntries((spec.questions || []).filter(q => q.type === 'choice' && q.correct != null).map(q => [q.id, q.correct])),
      transforms: Object.keys(TRANSFORMS), seriesBy: spec.graph?.seriesBy || null, fitKind: spec.graph?.fit || 'line',
      instruments: [...new Set([iv?.instrument, ...allReadings.map(r => r.instrument)].filter(Boolean))],
    },

    params(seed, options = {}) {
      const q = (name, lo, hi) => seeded(seed, name, lo, hi)
      q.pick = (name, list) => pick(seed, name, list)
      // j(name): a fixed value in [−1, 1] for this attempt, for physical
      // irregularities that must be the same every time they are read.
      const j = (name) => seeded(seed, 'j|' + name, -1, 1)
      return { seed, j, ...spec.hidden(q, options) }
    },

    initialState() {
      return { collected: null, firstCollectComplete: false, x: iv ? (iv.start ?? iv.min) : 0, settings: { ...defaultSettings },
        readings: {}, counter: 0, constants: {}, constShown: {}, rows: [], graph: { x: iv ? iv.key : measures[0]?.key, tx: 'none', y: measures[0]?.key || derived[0]?.key, ty: 'none' } }
    },

    actions: {
      collect(s, { items }) {
        const list = [...new Set((Array.isArray(items) ? items : []).map(String))]
        if (!list.length) fail('Choose the apparatus you need.')
        if (list.some(a => !stockroom.includes(a))) fail('That item is not in this stockroom.')
        if (s.collected == null) s.firstCollectComplete = required.every(a => list.includes(a))
        s.collected = list
      },
      setting(s, { key, value }) {
        const st = settings.find(x => x.key === key)
        if (!st || !st.options.some(o => String(o.value) === String(value))) fail('Choose one of the options.')
        s.settings[key] = st.options.find(o => String(o.value) === String(value)).value
        s.readings = {}
      },
      setIV(s, { value }) {
        if (!iv) fail('Nothing to vary in this experiment.')
        ensureApparatus(s)
        let v = num(value)
        if (!Number.isFinite(v) || v < iv.min - 1e-9 || v > iv.max + 1e-9) fail(`${iv.label} must be between ${iv.min} and ${iv.max} ${iv.unit || ''}.`)
        v = Number((Math.round((v - iv.min) / iv.step) * iv.step + iv.min).toFixed(6))
        if (iv.monotonic && s.rows.length && v < s.x) fail(`${iv.label} cannot go back to an earlier value.`)
        s.x = v
        s.readings = {}
      },
      measure(s, { key }, params) {
        const r = byKey[key]
        if (!r) fail('Unknown reading.')
        ensureApparatus(s)
        if (r.instrument && !s.collected.includes(r.instrument)) fail('You need the ' + apparatusName(r.instrument).toLowerCase() + ' for this reading.')
        s.counter += 1
        const n = noiseFor(params.seed, key, s.counter)
        const raw = r.kind === 'constant' ? r.read(params, n, s.settings) : r.read(params, s.x, n, s.settings)
        s.readings[key] = raw == null || !Number.isFinite(raw) ? null : toResolution(raw, r.resolution)
      },
      recordConst(s, { key, value }) {
        const c = constants.find(x => x.key === key)
        if (!c) fail('Unknown measurement.')
        if (s.readings[key] === undefined) fail('Take the ' + c.label.toLowerCase() + ' reading first.')
        if (!Number.isFinite(num(value))) fail('Enter the reading as a number.')
        s.constants[key] = num(value)
        s.constShown[key] = s.readings[key]
      },
      recordRow(s, { values }) {
        if (!measures.length) fail('There is nothing to tabulate in this experiment.')
        if (s.rows.length >= 60) fail('Sixty readings are plenty.')
        const vals = {}, shown = {}
        for (const m of measures) {
          if (s.readings[m.key] === undefined) fail('Take the ' + m.label.toLowerCase() + ' reading first' + (iv ? ' at this ' + (iv.symbol || iv.label) : '') + '.')
          const v = num(values?.[m.key])
          if (!Number.isFinite(v)) fail('Enter the ' + m.label.toLowerCase() + ' as a number.')
          vals[m.key] = v; shown[m.key] = s.readings[m.key]
        }
        s.rows.push({ x: s.x, settings: { ...s.settings }, values: vals, shown })
        s.readings = {}
      },
      deleteRow(s, { index }) {
        if (!s.rows[index]) fail('No such reading.')
        s.rows.splice(index, 1)
      },
      setGraph(s, { x, tx = 'none', y, ty = 'none' }) {
        if (!varByKey[x] || !varByKey[y]) fail('Choose a quantity for each axis.')
        if (!TRANSFORMS[tx] || !TRANSFORMS[ty]) fail('Unknown axis transformation.')
        if (x === y && tx === ty) fail('Choose different quantities for the two axes.')
        s.graph = { x, tx, y, ty }
      },
    },

    view(params, s) {
      return { collected: s.collected, x: s.x, settings: s.settings, readings: s.readings, constants: s.constants, rows: s.rows, graph: s.graph, groups: groups(s).map(g => ({ x: g.x, n: g.n, row: g.row, settings: g.settings })) }
    },

    dataTables(params, s) {
      const tables = []
      if (constants.length) tables.push({ title: 'Measurements', columns: ['Quantity', 'Value'], rows: constants.map(c => [`${c.label} ${c.symbol ? '(' + c.symbol + ')' : ''} / ${c.unit}`, s.constants[c.key] != null ? fmtRes(s.constants[c.key], c.resolution) : '—']) })
      if (measures.length) {
        const cs = typedConsts(s)
        const cols = [...(settings.length ? settings.map(x => x.label) : []), ...(iv ? [axisLabel(iv)] : []), ...measures.map(m => axisLabel(m)), ...derived.map(d => axisLabel(d))]
        tables.push({ title: 'Results', columns: cols, rows: s.rows.map(r => {
          const row = iv ? { [iv.key]: r.x } : {}
          for (const m of measures) row[m.key] = num(r.values[m.key])
          return [...settings.map(x => labelOfSetting(x, r.settings?.[x.key])), ...(iv ? [fmtNum(r.x)] : []), ...measures.map(m => fmtRes(row[m.key], m.resolution)),
            ...derived.map(d => { let v; try { v = d.value(row, cs, r.settings) } catch { v = NaN } return fmtNum(v, d.decimals) })]
        }) })
      }
      return tables
    },

    graph(params, s) {
      if (!correctGraph) return null
      const ch = s.graph || correctGraph
      if (!varByKey[ch.x] || !varByKey[ch.y]) return null
      const gs = groups(s)
      const pts = pointsFor(gs, ch)
      const base = { title: axisLabel(varByKey[ch.y], ch.ty).split(' / ')[0] + ' against ' + axisLabel(varByKey[ch.x], ch.tx).split(' / ')[0],
        xLabel: axisLabel(varByKey[ch.x], ch.tx), yLabel: axisLabel(varByKey[ch.y], ch.ty) }
      if (spec.graph.seriesBy) {
        const st = settings.find(x => x.key === spec.graph.seriesBy)
        const series = st.options.map(o => {
          const p = pts.filter(q => String(q.g.settings[st.key]) === String(o.value)).map(({ x, y }) => ({ x, y }))
          return { name: o.label, points: p, line: fitOf(p, spec.graph.fit) }
        }).filter(x => x.points.length)
        return { ...base, points: pts.map(({ x, y }) => ({ x, y })), line: series[0]?.line || null, series }
      }
      const p = pts.map(({ x, y }) => ({ x, y }))
      const line = fitOf(p, spec.graph.fit)
      return { ...base, points: p, line: line ? { m: line.m, c: line.c } : null }
    },

    questions,
    expected({ params, state }) {
      const out = {}
      for (const r of results) {
        const own = ownResult(r, state)
        out['r_' + r.id] = own != null && Number.isFinite(own) ? toSigFigs(own, r.sig || 3) : null
        out['true' + r.id[0].toUpperCase() + r.id.slice(1)] = toSigFigs(r.truth(params), r.sig || 3)
      }
      return out
    },
    rubric,
    correctGraph,
  }

  function ensureApparatus(s) {
    if (!s.collected) fail('Collect your apparatus from the stockroom first.')
    const missing = required.filter(a => !s.collected.includes(a))
    if (missing.length) fail('Something you need is missing from your bench. Check the apparatus list.')
  }
  return def
}

function labelOfSetting(st, v) { return st.options.find(o => String(o.value) === String(v))?.label ?? String(v ?? '') }

function pickDistractors(id, required) {
  const pool = Object.keys(APPARATUS).filter(a => !required.includes(a) && a !== 'goggles')
  const r = rng(hashSeed('distractors|' + id))
  const out = []
  while (out.length < 4 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0])
  return out
}
function shuffle(id, list) {
  const r = rng(hashSeed('stock|' + id)), a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
