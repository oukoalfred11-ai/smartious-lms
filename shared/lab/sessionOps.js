/**
 * sessionOps.js — the rules for saving, submitting and marking a lab
 * session, as pure functions on plain objects. The backend wraps these
 * with persistence; tests exercise them directly.
 *
 * Session shape (plain object):
 *   { status, revision, seed, options, actions[], notebook{}, answers{},
 *     autoGrade, rubricMarks{}, score, maxScore, submissionKey, feedback }
 */
import { paramsFor, replay, gradeSession, MAX_ACTIONS } from './engine.js'
import { EDITABLE, validateMarks } from './access.js'

export const NOTEBOOK_SECTIONS = ['aim', 'hypothesis', 'variables', 'apparatus', 'procedure', 'observations', 'analysis', 'evaluation', 'conclusion']
const MAX_TEXT = 10000

export class SessionOpError extends Error {
  constructor(message, code = 400, extra = {}) { super(message); this.code = code; Object.assign(this, extra) }
}

function cleanNotebook(nb = {}) {
  const out = {}
  for (const k of NOTEBOOK_SECTIONS) {
    if (nb[k] == null) continue
    const v = String(nb[k])
    if (v.length > MAX_TEXT) throw new SessionOpError('The ' + k + ' section is too long (max ' + MAX_TEXT + ' characters).')
    out[k] = v
  }
  return out
}

function cleanAnswers(def, ans = {}) {
  const out = {}
  for (const q of def.questions) {
    if (ans[q.id] == null) continue
    const v = String(ans[q.id])
    if (v.length > MAX_TEXT) throw new SessionOpError('Answer to "' + q.prompt + '" is too long.')
    out[q.id] = v
  }
  return out
}

/** State of a session, rebuilt from its action log. */
export function stateOf(def, session) {
  const params = paramsFor(def, session.seed, session.options)
  return { params, state: replay(def, params, session.actions || []) }
}

/**
 * Save progress. The client sends the revision it last saw and only the
 * actions added since (fromIndex = how many the server already has).
 * Returns the fields to update. Throws 409 on a stale revision so two tabs
 * can never overwrite each other's work silently.
 */
export function applySave(def, session, body) {
  if (!EDITABLE.includes(session.status)) throw new SessionOpError('This work has been submitted and can no longer be changed.', 409)
  if (Number(body.baseRevision) !== session.revision)
    throw new SessionOpError('This experiment was saved from another tab or device. Reload to continue from the latest copy.', 409, { conflict: true })
  const have = (session.actions || []).length
  const newActions = Array.isArray(body.newActions) ? body.newActions : []
  if (Number(body.fromIndex ?? have) !== have) throw new SessionOpError('Out-of-order save. Reload to continue.', 409, { conflict: true })
  const actions = [...(session.actions || []), ...newActions.map(a => ({ type: String(a?.type || ''), payload: a?.payload ?? {} }))]
  if (actions.length > MAX_ACTIONS) throw new SessionOpError('This session has too many actions. Reset the experiment to continue.')
  const params = paramsFor(def, session.seed, session.options)
  try { replay(def, params, actions) }
  catch (e) { throw new SessionOpError('An action could not be applied: ' + e.message, 422) }
  return {
    actions,
    notebook: body.notebook !== undefined ? cleanNotebook(body.notebook) : session.notebook,
    answers: body.answers !== undefined ? cleanAnswers(def, body.answers) : session.answers,
    revision: session.revision + 1,
  }
}

/** Submit for marking. Idempotent for a repeated submissionKey. */
export function applySubmit(def, session, { baseRevision, submissionKey, now = new Date() }) {
  if (session.status === 'submitted' && submissionKey && session.submissionKey === submissionKey) return { duplicate: true }
  if (!EDITABLE.includes(session.status)) throw new SessionOpError('This work has already been submitted.', 409)
  if (Number(baseRevision) !== session.revision) throw new SessionOpError('Save your latest changes before submitting.', 409, { conflict: true })
  if (!submissionKey || String(submissionKey).length < 8) throw new SessionOpError('Missing submission key.')
  const { params, state } = stateOf(def, session)
  const autoGrade = gradeSession(def, { params, state, answers: session.answers || {} })
  return {
    status: 'submitted', submissionKey: String(submissionKey), submittedAt: now,
    autoGrade, score: autoGrade.autoMarks, maxScore: autoGrade.max, revision: session.revision + 1,
  }
}

/**
 * Teacher marking. Teacher marks override auto marks row by row. 'mark'
 * needs every teacher-marked row scored; 'return' sends the work back for
 * correction with feedback (the student can edit and resubmit).
 */
export function applyMark(def, session, { marks = {}, feedback = '', action = 'mark', markerName = '', now = new Date() }) {
  if (!['submitted', 'marked', 'returned'].includes(session.status)) throw new SessionOpError('Only submitted work can be marked.', 409)
  const rows = session.autoGrade?.rows
  if (!rows) throw new SessionOpError('This submission has no grading record.', 409)
  const problems = validateMarks(rows, marks)
  if (problems.length) throw new SessionOpError(problems.join(' '))
  if (String(feedback).length > MAX_TEXT) throw new SessionOpError('Feedback is too long.')
  const finalRows = rows.map(r => {
    const t = marks[r.id]
    return t !== undefined && t !== '' && t !== null ? { ...r, marks: Number(t), overridden: r.auto } : r
  })
  if (action === 'mark') {
    const missing = finalRows.filter(r => r.marks == null)
    if (missing.length) throw new SessionOpError('Give marks for: ' + missing.map(r => r.label).join(', ') + '.')
  } else if (action === 'return') {
    if (!String(feedback).trim()) throw new SessionOpError('Tell the student what to correct.')
  } else throw new SessionOpError('Unknown action.')
  const score = finalRows.reduce((a, r) => a + (r.marks || 0), 0)
  return {
    status: action === 'mark' ? 'marked' : 'returned',
    rubricMarks: Object.fromEntries(finalRows.map(r => [r.id, r.marks])),
    markedRows: finalRows, score, maxScore: rows.reduce((a, r) => a + r.max, 0),
    feedback: String(feedback), markedByName: markerName,
    [action === 'mark' ? 'markedAt' : 'returnedAt']: now,
  }
}
