const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
  // 3-Point Check: Student + Subject + Curriculum + Teacher
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  curriculum: { type: String, required: true }, // Student's curriculum (denormalized for query speed)
  
  // Status and metadata
  status: { type: String, enum: ['Active', 'Pending', 'Inactive', 'Completed'], default: 'Active' },
  emailsSent: { type: Boolean, default: false },
  
  // Audit trail
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
});

// Ensure one teacher per subject, per student
AllocationSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Allocation', AllocationSchema);

