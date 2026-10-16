/**
 * engine.js — runs experiments.
 *
 * An experiment definition (experiments/*.js) is pure data plus pure
 * functions. A session is { seed, options, actions[] }:
 *   • params  = def.params(seed, options)       hidden + visible conditions
 *   • state   = replay of every action in order  (deterministic)
 *   • view    = def.view(params, state)          what instruments show
 *   • grade   = def.grade(ctx)                   auto-marked rubric items
 * The action log is the source of truth. The server replays it, so a
 * saved or submitted result cannot be forged by editing state in the
 * browser, and the same session always reloads to the same situation.
 */
export class LabActionError extends Error {
  constructor(message) { super(message); this.name = 'LabActionError' }
}
export const fail = (msg) => { throw new LabActionError(msg) }

const clone = (x) => (typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x)))

export const MAX_ACTIONS = 5000

export function paramsFor(def, seed, options = {}) {
  return def.params(String(seed), options || {})
}

/** Apply one action; returns the new state (input is not mutated). */
export function applyAction(def, params, state, action) {
  if (!action || typeof action.type !== 'string') fail('Unknown action.')
  const handler = def.actions[action.type]
  if (!handler) fail('This action is not available in this experiment.')
  const next = clone(state)
  const out = handler(next, action.payload || {}, params)
  return out === undefined ? next : out
}

/** Rebuild state from the full action log. Throws on the first invalid action. */
export function replay(def, params, actions = []) {
  if (actions.length > MAX_ACTIONS) fail('Too many actions in one session.')
  let state = def.initialState(params)
  actions.forEach((a, i) => {
    try { state = applyAction(def, params, state, a) }
    catch (e) { const err = new LabActionError(`Action ${i + 1} (${a?.type}): ${e.message}`); err.index = i; throw err }
  })
  return state
}

export const viewOf = (def, params, state) => def.view(params, state)

/**
 * Auto-mark. Returns rubric rows; teacher-marked rows have auto=false and
 * marks=null until a teacher scores them.
 */
export function gradeSession(def, { params, state, answers = {} }) {
  const ctx = { params, state, answers, view: def.view(params, state) }
  const rows = def.rubric.map(r => {
    if (!r.auto) return { id: r.id, label: r.label, max: r.marks, marks: null, auto: false, detail: r.guidance || '' }
    let res
    try { res = r.auto(ctx) } catch (e) { res = { marks: 0, detail: 'Could not be checked: ' + e.message } }
    if (res?.na) return null                     // does not apply to this attempt (e.g. apparatus provided)
    const marks = Math.max(0, Math.min(r.marks, Number(res?.marks) || 0))
    return { id: r.id, label: r.label, max: r.marks, marks, auto: true, detail: res?.detail || '' }
  }).filter(Boolean)
  const autoMax = rows.filter(r => r.auto).reduce((a, r) => a + r.max, 0)
  const autoMarks = rows.filter(r => r.auto).reduce((a, r) => a + r.marks, 0)
  const max = rows.reduce((a, r) => a + r.max, 0)
  return { rows, autoMarks, autoMax, max }
}

/** Questions answered check: numeric answers parse, required present. */
export function checkAnswers(def, answers = {}) {
  const problems = []
  for (const q of def.questions) {
    const v = answers[q.id]
    if (q.type === 'numeric' && v !== undefined && v !== '' && !Number.isFinite(Number(v))) problems.push(q.prompt + ': must be a number')
  }
  return problems
}

/** Static validation of a definition before it can be published. */
export function validateDefinition(def) {
  const p = []
  const need = ['id', 'version', 'subject', 'title', 'summary', 'objectives', 'safety', 'apparatus', 'procedure', 'model',
    'params', 'initialState', 'actions', 'view', 'questions', 'rubric', 'curriculum', 'notebook', 'dataTables', 'graph']
  for (const k of need) if (def[k] === undefined) p.push('missing ' + k)
  if (!['chemistry', 'physics', 'biology'].includes(def.subject)) p.push('subject must be chemistry, physics or biology')
  if (!Array.isArray(def.model?.assumptions) || !def.model.assumptions.length) p.push('model.assumptions must be listed')
  if (typeof def.model?.kind !== 'string') p.push('model.kind must say whether the model is quantitative or a simplified educational model')
  const qids = new Set()
  for (const q of def.questions || []) {
    if (qids.has(q.id)) p.push('duplicate question id ' + q.id)
    qids.add(q.id)
    if (!['numeric', 'text', 'choice'].includes(q.type)) p.push('question ' + q.id + ': bad type')
    if (q.type === 'choice' && !(q.options?.length >= 2)) p.push('question ' + q.id + ': choices needed')
  }
  const rids = new Set()
  for (const r of def.rubric || []) {
    if (rids.has(r.id)) p.push('duplicate rubric id ' + r.id)
    rids.add(r.id)
    if (!(r.marks > 0)) p.push('rubric ' + r.id + ': marks must be positive')
  }
  for (const c of def.curriculum || []) {
    if (!c.board || !c.level || !c.topic) p.push('curriculum entries need board, level and topic')
    if (c.syllabusRef && c.verified !== true) p.push('syllabus reference ' + c.syllabusRef + ' must be verified against the official syllabus before it is shown')
  }
  try {
    const params = def.params('validation-seed', {})
    const s = def.initialState(params)
    def.view(params, s)
    def.dataTables(params, s)
    def.graph(params, s)
  } catch (e) { p.push('initial state fails: ' + e.message) }
  return p
}
