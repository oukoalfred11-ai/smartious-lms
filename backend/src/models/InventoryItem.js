/**
 * InventoryItem.js - the school's physical and digital estate.
 * Two kinds: assets (tracked one by one, tagged, assigned to a
 * custodian) and consumables (tracked by quantity with a reorder
 * level). Every lifecycle event - moves, assignments, condition and
 * status changes, stock adjustments - lands in the movements trail,
 * which is the permanent record of accountability.
 */
const mongoose = require('mongoose');

const CATEGORIES = ['Electronics', 'Furniture', 'Books and Materials', 'Lab Equipment', 'Sports Equipment', 'Office Supplies', 'Software Licences', 'Other'];
const LOCATIONS = ['Parklands Centre', 'Karen Centre', 'Storage', 'Online / Cloud', 'With Staff'];

const inventoryItemSchema = new mongoose.Schema({
  assetTag: { type: String, unique: true, index: true },   // SHG/INV/0001, assigned on create
  name: { type: String, required: true, trim: true, maxlength: 140 },
  category: { type: String, enum: CATEGORIES, required: true, index: true },
  kind: { type: String, enum: ['asset', 'consumable'], default: 'asset', index: true },
  serialNumber: { type: String, trim: true, default: '' },
  location: { type: String, enum: LOCATIONS, default: 'Parklands Centre', index: true },
  custodianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  custodianName: { type: String, trim: true, default: '' },
  quantity: { type: Number, default: 1, min: 0 },
  unit: { type: String, trim: true, default: 'pcs' },
  reorderLevel: { type: Number, default: 0, min: 0 },   // consumables: alert when quantity falls to or below this
  purchaseDate: { type: Date, default: null },
  purchaseCost: { type: Number, default: 0, min: 0 },   // KES, per unit
  supplier: { type: String, trim: true, default: '' },
  condition: { type: String, enum: ['New', 'Good', 'Fair', 'Needs Repair', 'Retired'], default: 'Good' },
  status: { type: String, enum: ['in_service', 'assigned', 'in_repair', 'retired', 'lost'], default: 'in_service', index: true },
  notes: { type: String, trim: true, maxlength: 1000, default: '' },
  movements: [{
    at: { type: Date, default: Date.now },
    byName: { type: String, default: '' },
    action: { type: String, default: '' },     // created, moved, assigned, status, condition, stock, edited
    detail: { type: String, default: '' },
  }],
}, { timestamps: true });

inventoryItemSchema.statics.CATEGORIES = CATEGORIES;
inventoryItemSchema.statics.LOCATIONS = LOCATIONS;

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
