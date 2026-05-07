const mongoose = require('mongoose');

const GroupRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  curriculum: { type: String },
  grade: { type: String },
  capacity: { type: Number, default: 10 },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  schedule: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  zoomLink: { type: String, default: '' },
  zoomStartedAt: { type: Date },
  zoomStartedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupRoom', GroupRoomSchema);

