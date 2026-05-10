// Atomic counter for auto-incrementing IDs (admission numbers, etc.)
// Uses MongoDB's $inc to guarantee no race conditions even under load.

const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },  // e.g. 'admission-2026'
  seq: { type: Number, default: 0 },
}, { collection: 'counters' })

module.exports = mongoose.model('Counter', counterSchema)
