const mongoose = require('mongoose');

const TeacherLeaveRequestSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: String, // Cached for quick display
  teacherEmail: String,
  
  // Leave details
  leaveStartDate: { type: Date, required: true },
  leaveEndDate: { type: Date, required: true },
  leaveReason: { type: String, required: true },
  leaveType: { type: String, enum: ['Personal', 'Medical', 'Emergency', 'Other'], default: 'Personal' },
  
  // Approval workflow
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], 
    default: 'Pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who approved
  approvalDate: Date,
  rejectionReason: String,
  
  // Temporary replacement during leave
  temporaryReplacementTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: another teacher to cover
  
  // Affected allocations tracking
  affectedAllocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Allocation' }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
TeacherLeaveRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TeacherLeaveRequest', TeacherLeaveRequestSchema);

