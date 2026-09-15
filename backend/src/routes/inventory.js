/**
 * inventory.js - the finance portal's inventory.
 *   GET    /api/inventory            list + finance KPIs
 *   POST   /api/inventory            create (auto asset tag)
 *   GET    /api/inventory/:id        one item with its movement trail
 *   PATCH  /api/inventory/:id        edit; changes recorded as movements
 *   POST   /api/inventory/:id/adjust consumable stock in or out
 * Nothing is ever deleted: retirement and loss are statuses, and the
 * movement trail is the permanent record of accountability.
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const InventoryItem = require('../models/InventoryItem');

const FINANCE = requireRole('admin', 'accountant', 'ops_manager');
const nameOf = (u) => [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
const move = (byName, action, detail) => ({ at: new Date(), byName, action, detail });

// ── List + KPIs ──
router.get('/', auth, FINANCE, async (req, res) => {
  try {
    const { category, location, status, kind, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (kind) filter.kind = kind;
    let items = await InventoryItem.find(filter).sort({ updatedAt: -1 }).select('-movements').lean();
    if (q && q.trim()) {
      const needle = q.trim().toLowerCase();
      items = items.filter(i => (i.name + ' ' + i.assetTag + ' ' + (i.serialNumber || '') + ' ' + (i.custodianName || '') + ' ' + (i.supplier || '')).toLowerCase().includes(needle));
    }

    const all = await InventoryItem.find({}).select('kind quantity purchaseCost reorderLevel status category').lean();
    const value = (x) => (x.purchaseCost || 0) * (x.quantity || 0);
    const active = all.filter(x => x.status !== 'retired' && x.status !== 'lost');
    const byCategory = {};
    active.forEach(x => { byCategory[x.category] = (byCategory[x.category] || 0) + value(x); });
    const kpis = {
      items: active.length,
      totalValue: Math.round(active.reduce((s, x) => s + value(x), 0)),
      lowStock: all.filter(x => x.kind === 'consumable' && x.status !== 'retired' && x.reorderLevel > 0 && x.quantity <= x.reorderLevel).length,
      inRepair: all.filter(x => x.status === 'in_repair').length,
      lostValue: Math.round(all.filter(x => x.status === 'lost').reduce((s, x) => s + value(x), 0)),
      retired: all.filter(x => x.status === 'retired').length,
    };

    res.json({ success: true, data: { items, kpis, byCategory,
      categories: InventoryItem.CATEGORIES, locations: InventoryItem.LOCATIONS,
      method: 'Value is unit cost times quantity, in KES, over items neither retired nor lost. Low stock counts consumables at or below their reorder level. Lost value is the replacement exposure of items marked lost. Every move, assignment, status change and stock adjustment is recorded on the item\u2019s movement trail.' } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Create ──
router.post('/', auth, FINANCE, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !String(b.name).trim()) return res.status(400).json({ success: false, message: 'The item needs a name.' });
    if (!InventoryItem.CATEGORIES.includes(b.category)) return res.status(400).json({ success: false, message: 'Choose a category.' });

    const count = await InventoryItem.countDocuments({});
    const assetTag = 'SHG/INV/' + String(count + 1).padStart(4, '0');
    const by = nameOf(req.user);

    const item = await InventoryItem.create({
      assetTag,
      name: String(b.name).trim(),
      category: b.category,
      kind: b.kind === 'consumable' ? 'consumable' : 'asset',
      serialNumber: String(b.serialNumber || '').trim(),
      location: InventoryItem.LOCATIONS.includes(b.location) ? b.location : 'Parklands Centre',
      quantity: Math.max(0, Number(b.quantity) || 1),
      unit: String(b.unit || 'pcs').trim(),
      reorderLevel: Math.max(0, Number(b.reorderLevel) || 0),
      purchaseDate: b.purchaseDate ? new Date(b.purchaseDate) : null,
      purchaseCost: Math.max(0, Number(b.purchaseCost) || 0),
      supplier: String(b.supplier || '').trim(),
      condition: ['New', 'Good', 'Fair', 'Needs Repair', 'Retired'].includes(b.condition) ? b.condition : 'Good',
      notes: String(b.notes || '').trim(),
      movements: [move(by, 'created', 'Item registered')],
    });
    res.json({ success: true, data: { item: item.toObject() } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── One item with trail ──
router.get('/:id', auth, FINANCE, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    item.movements = (item.movements || []).slice(-60).reverse();
    res.json({ success: true, data: { item } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Edit: field changes become movement entries ──
router.patch('/:id', auth, FINANCE, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    const b = req.body || {};
    const by = nameOf(req.user);

    if (b.location !== undefined && b.location !== item.location && InventoryItem.LOCATIONS.includes(b.location)) {
      item.movements.push(move(by, 'moved', item.location + ' \u2192 ' + b.location));
      item.location = b.location;
    }
    if (b.custodianName !== undefined && b.custodianName !== item.custodianName) {
      item.movements.push(move(by, 'assigned', b.custodianName ? 'Assigned to ' + b.custodianName : 'Returned from ' + (item.custodianName || 'custodian')));
      item.custodianName = String(b.custodianName || '').trim();
      item.custodianId = b.custodianId || null;
      item.status = item.custodianName ? 'assigned' : (item.status === 'assigned' ? 'in_service' : item.status);
    }
    if (b.status !== undefined && b.status !== item.status && ['in_service', 'assigned', 'in_repair', 'retired', 'lost'].includes(b.status)) {
      item.movements.push(move(by, 'status', item.status + ' \u2192 ' + b.status));
      item.status = b.status;
    }
    if (b.condition !== undefined && b.condition !== item.condition && ['New', 'Good', 'Fair', 'Needs Repair', 'Retired'].includes(b.condition)) {
      item.movements.push(move(by, 'condition', item.condition + ' \u2192 ' + b.condition));
      item.condition = b.condition;
    }
    for (const k of ['name', 'serialNumber', 'supplier', 'unit', 'notes']) {
      if (b[k] !== undefined && String(b[k]).trim() !== (item[k] || '')) item[k] = String(b[k]).trim();
    }
    for (const k of ['purchaseCost', 'reorderLevel']) {
      if (b[k] !== undefined && Number(b[k]) >= 0) item[k] = Number(b[k]);
    }
    if (b.purchaseDate !== undefined) item.purchaseDate = b.purchaseDate ? new Date(b.purchaseDate) : null;
    if (b.category !== undefined && InventoryItem.CATEGORIES.includes(b.category)) item.category = b.category;

    await item.save();
    res.json({ success: true, data: { item: item.toObject() } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Consumable stock in or out ──
router.post('/:id/adjust', auth, FINANCE, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    const delta = Number(req.body.delta);
    const note = String(req.body.note || '').trim();
    if (!delta || !Number.isFinite(delta)) return res.status(400).json({ success: false, message: 'delta must be a nonzero number.' });
    const next = (item.quantity || 0) + delta;
    if (next < 0) return res.status(400).json({ success: false, message: 'Stock cannot go below zero. Current: ' + item.quantity + ' ' + item.unit + '.' });
    item.quantity = next;
    item.movements.push(move(nameOf(req.user), 'stock', (delta > 0 ? '+' : '') + delta + ' ' + item.unit + (note ? ' \u00b7 ' + note : '') + ' \u2192 now ' + next));
    await item.save();
    res.json({ success: true, data: { item: item.toObject() } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
