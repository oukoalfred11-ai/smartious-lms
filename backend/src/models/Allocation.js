const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Allocated subjects
  curriculum: { type: String }, // Student's curriculum
  programmeId: { type: String },
  sessionSlot: { type: String }, // e.g., "Mon/Wed 10am"
  matchType: { type: String, enum: ['Auto', 'Manual', 'Matched'], default: 'Manual' },
  matchScore: { type: Number, default: 0, min: 0, max: 100 }, // Match percentage (0-100)
  status: { type: String, enum: ['Active', 'Pending', 'Inactive', 'Completed'], default: 'Pending' },
  startDate: { type: Date },
  endDate: { type: Date },
  emailsSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  previousTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
});

module.exports = mongoose.model('Allocation', AllocationSchema);

