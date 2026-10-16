// The browser panels, 2D diagrams and 3D scenes read these view fields.
// If an experiment's view() changes shape, this test fails before the UI does.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getExperiment } from '../experiments/index.js'
import { paramsFor, replay, viewOf } from '../engine.js'
import { NOTEBOOK_SECTIONS } from '../sessionOps.js'

const has = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o) !== undefined

function check(id, actions, fields) {
  const def = getExperiment(id)
  const params = paramsFor(def, 'contract-seed', {})
  const state = replay(def, params, actions)
  const view = viewOf(def, params, state)
  for (const f of fields) assert.ok(has(view, f), `${id}: view.${f} missing`)
  for (const t of def.dataTables(params, state)) { assert.ok(t.title && Array.isArray(t.columns) && Array.isArray(t.rows)); t.rows.forEach(r => assert.equal(r.length, t.columns.length)) }
  const g = def.graph(params, state)
  if (g) { assert.ok(Array.isArray(g.points) && g.xLabel && g.yLabel && g.title); g.points.forEach(p => assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y))) }
  return view
}

test('titration view has what the UI reads', () => {
  const v = check('chem-titration', [{ type: 'fillBurette' }, { type: 'pipetteAcid' }, { type: 'chooseIndicator', payload: { indicator: 'phenolphthalein' } }, { type: 'addIndicator' }, { type: 'addBase', payload: { volume: 5 } }],
    ['run', 'runs', 'flask.hasAcid', 'flask.volume', 'flask.pH', 'flask.colour', 'flask.colourName', 'flask.overshot', 'burette.filled', 'burette.reading', 'burette.max', 'indicatorChosen', 'titres.concordant'])
  assert.equal(v.flask.colour.length, 4)
  assert.ok(v.runs[0].initial === null || v.runs[0].initial === undefined || Number.isFinite(v.runs[0].initial))
})

test('Ohm’s law view has what the UI reads', () => {
  const v = check('phys-ohms-law', [{ type: 'connect', payload: { a: 'PS.+', b: 'S1.a' } }, { type: 'setSupply', payload: { volts: 3 } }],
    ['supplyV', 'switchClosed', 'wires', 'fault', 'problems', 'meters.A1', 'meters.V1', 'rows'])
  assert.deepEqual(v.wires, [['PS.+', 'S1.a']])
})

test('osmosis view has what the UI reads', () => {
  const v = check('bio-osmosis', [{ type: 'select', payload: { index: 2 } }], ['clock', 'immersed', 'elapsed', 'selected', 'balance', 'tubes'])
  assert.equal(v.tubes.length, 6)
  for (const t of v.tubes) for (const k of ['C', 'm0', 'm1', 'removed', 'percent', 'visual']) assert.ok(k in t, k)
  assert.ok(Number.isFinite(v.balance))
})

test('notebook sections match the report sections', () => {
  assert.deepEqual(NOTEBOOK_SECTIONS, ['aim', 'hypothesis', 'variables', 'risk', 'apparatus', 'procedure', 'observations', 'analysis', 'evaluation', 'conclusion'])
})
