const mongoose = require('mongoose');

const ProgrammeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  country: { type: String },
  fee: { type: Number },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Programme', ProgrammeSchema);

