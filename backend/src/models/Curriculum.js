const mongoose = require('mongoose');

const CurriculumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  org: { type: String },
  subjects: [{ type: String }],
  students: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Draft', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Curriculum', CurriculumSchema);

