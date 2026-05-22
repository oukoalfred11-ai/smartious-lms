const mongoose = require('mongoose');

const GroupRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  curriculum: { type: String },
  grade: { type: String },
  capacity: { type: Number, default: 10 },
  // teacher refs User (with role='teacher') — the actual teacher records
  // live in the users collection, not a separate Teacher collection.
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  schedule: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  // Flag for rooms auto-created from admin allocations (vs manually-built rooms).
  // Used to identify the "default all-students" room per teacher.
  isAutoAllocation: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupRoom', GroupRoomSchema);
