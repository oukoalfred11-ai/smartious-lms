import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getExperiment } from '../experiments/index.js'
import { applySave, applySubmit, applyMark, stateOf, SessionOpError } from '../sessionOps.js'

const def = getExperiment('phys-ohms-law')
const fresh = () => ({ status: 'in_progress', revision: 0, seed: 'abc123', options: {}, actions: [], notebook: {}, answers: {} })
const save = (s, body) => ({ ...s, ...applySave(def, s, body) })

test('save appends validated actions and bumps the revision', () => {
  let s = fresh()
  s = save(s, { baseRevision: 0, fromIndex: 0, newActions: [{ type: 'connect', payload: { a: 'PS.+', b: 'S1.a' } }], notebook: { hypothesis: 'V ∝ I' } })
  assert.equal(s.revision, 1)
  assert.equal(s.actions.length, 1)
  assert.equal(s.notebook.hypothesis, 'V ∝ I')
  assert.equal(stateOf(def, s).state.wires.length, 1)
})

test('stale revision or out-of-order save is a conflict, never a silent overwrite', () => {
  const s = { ...fresh(), revision: 3 }
  assert.throws(() => applySave(def, s, { baseRevision: 2, fromIndex: 0, newActions: [] }), e => e.code === 409 && e.conflict)
  assert.throws(() => applySave(def, s, { baseRevision: 3, fromIndex: 5, newActions: [] }), e => e.code === 409)
})

test('an invalid action is rejected and nothing is saved', () => {
  assert.throws(() => applySave(def, fresh(), { baseRevision: 0, fromIndex: 0, newActions: [{ type: 'setSupply', payload: { volts: 99 } }] }), e => e.code === 422)
  assert.throws(() => applySave(def, fresh(), { baseRevision: 0, fromIndex: 0, newActions: [{ type: 'rm -rf', payload: {} }] }), e => e.code === 422)
})

test('oversized notebook sections are refused', () => {
  assert.throws(() => applySave(def, fresh(), { baseRevision: 0, fromIndex: 0, notebook: { analysis: 'x'.repeat(10001) } }), SessionOpError)
})

test('submit grades on the server, is idempotent, and locks editing', () => {
  let s = fresh()
  const sub = applySubmit(def, s, { baseRevision: 0, submissionKey: 'key-12345678' })
  assert.equal(sub.status, 'submitted')
  assert.ok(sub.autoGrade.rows.length > 0)
  s = { ...s, ...sub }
  assert.deepEqual(applySubmit(def, s, { baseRevision: 0, submissionKey: 'key-12345678' }), { duplicate: true })
  assert.throws(() => applySubmit(def, s, { baseRevision: s.revision, submissionKey: 'another-key-1' }), e => e.code === 409)
  assert.throws(() => applySave(def, s, { baseRevision: s.revision, fromIndex: 0, newActions: [] }), e => e.code === 409)
})

test('submit with unsaved changes (stale revision) is refused', () => {
  assert.throws(() => applySubmit(def, { ...fresh(), revision: 2 }, { baseRevision: 1, submissionKey: 'key-12345678' }), e => e.conflict)
})

test('marking requires every teacher row, totals correctly, and return needs feedback', () => {
  let s = { ...fresh(), ...applySubmit(def, fresh(), { baseRevision: 0, submissionKey: 'key-12345678' }) }
  assert.throws(() => applyMark(def, s, { marks: {}, action: 'mark' }), /Give marks/)
  const m = applyMark(def, s, { marks: { report: 3 }, feedback: 'Good graph', action: 'mark', markerName: 'T' })
  assert.equal(m.status, 'marked')
  assert.equal(m.score, s.autoGrade.autoMarks + 3)
  assert.throws(() => applyMark(def, s, { marks: { report: 9 }, action: 'mark' }), /marks must be/)
  assert.throws(() => applyMark(def, s, { marks: {}, action: 'return', feedback: ' ' }), /what to correct/)
  const r = applyMark(def, s, { marks: {}, action: 'return', feedback: 'Add units to your table.' })
  assert.equal(r.status, 'returned')
})

test('teacher can override an auto-marked row (recorded as overridden)', () => {
  const s = { ...fresh(), ...applySubmit(def, fresh(), { baseRevision: 0, submissionKey: 'key-12345678' }) }
  const m = applyMark(def, s, { marks: { report: 2, circuit: 1 }, action: 'mark' })
  assert.equal(m.markedRows.find(r => r.id === 'circuit').overridden, true)
})

test('work in progress cannot be marked', () => {
  assert.throws(() => applyMark(def, fresh(), { marks: {}, action: 'mark' }), e => e.code === 409)
})
