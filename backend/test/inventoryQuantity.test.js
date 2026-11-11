const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')

// PATCH /api/inventory/:id must save an edited quantity (it was ignored)
// and log the change in the movements trail.
let item = null
const pass = (req, res, next) => next()
const load = Module._load
Module._load = function (req, ...rest) {
  if (/middleware\/auth$/.test(req)) return { auth: pass, requireRole: () => pass }
  if (/models\/InventoryItem$/.test(req)) { const M = { findById: async () => item, LOCATIONS: ['Parklands Centre'], CATEGORIES: ['Stationery'] }; return M }
  return load.call(this, req, ...rest)
}
const router = require('../src/routes/inventory')
const layer = router.stack.find(l => l.route && l.route.path === '/:id' && l.route.methods.patch)
const fn = layer.route.stack[layer.route.stack.length - 1].handle
const call = (body) => new Promise((resolve) => {
  const res = { statusCode: 200, status(c) { this.statusCode = c; return this }, json(b) { resolve({ status: this.statusCode, body: b }) } }
  fn({ params: { id: 'i1' }, body, user: { firstName: 'Ann', lastName: 'Admin' } }, res)
})
const fresh = (o) => ({ _id: 'i1', name: 'A4 paper', unit: 'reams', quantity: 10, location: 'Parklands Centre', status: 'in_service', condition: 'Good', category: 'Stationery', movements: [], saved: 0, save: async function () { this.saved++ }, toObject() { return this }, ...o })

test('an edited quantity is saved and logged', async () => {
  item = fresh()
  const r = await call({ name: 'A4 paper', quantity: '14' })
  assert.equal(r.status, 200)
  assert.equal(item.quantity, 14)
  assert.equal(item.saved, 1)
  assert.match(item.movements.at(-1).detail, /Quantity edited: 10 → 14 reams \(\+4\)/)
})

test('lowering to zero works', async () => {
  item = fresh()
  await call({ quantity: 0 })
  assert.equal(item.quantity, 0)
})

test('an unchanged quantity adds no movement', async () => {
  item = fresh()
  await call({ quantity: 10, name: 'A4 paper' })
  assert.equal(item.movements.length, 0)
})

test('a blank field leaves the quantity alone', async () => {
  item = fresh()
  await call({ quantity: '' })
  assert.equal(item.quantity, 10)
})

test('negative or non-numeric quantities are refused, nothing saved', async () => {
  for (const q of [-3, 'abc']) {
    item = fresh()
    const r = await call({ quantity: q })
    assert.equal(r.status, 400); assert.equal(item.quantity, 10); assert.equal(item.saved, 0)
  }
})
