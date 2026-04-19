require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const TeacherLeaveRequest = require('./src/models/TeacherLeaveRequest');

const MONGODB_URI = process.env.MONGODB_URI;

async function seedLeaveRequests() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a teacher
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('❌ No teachers found in database. Please add a teacher first.');
      process.exit(1);
    }

    console.log(`Found teacher: ${teacher.firstName} ${teacher.lastName}`);

    // Create sample leave requests
    const leaveRequests = [
      {
        teacherId: teacher._id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        teacherEmail: teacher.email,
        leaveStartDate: new Date('2026-04-20'),
        leaveEndDate: new Date('2026-04-22'),
        leaveReason: 'Family vacation',
        leaveType: 'Personal',
        status: 'Pending'
      },
      {
        teacherId: teacher._id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        teacherEmail: teacher.email,
        leaveStartDate: new Date('2026-05-01'),
        leaveEndDate: new Date('2026-05-03'),
        leaveReason: 'Medical appointment',
        leaveType: 'Medical',
        status: 'Pending'
      },
      {
        teacherId: teacher._id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        teacherEmail: teacher.email,
        leaveStartDate: new Date('2026-06-10'),
        leaveEndDate: new Date('2026-06-12'),
        leaveReason: 'Conference attendance',
        leaveType: 'Other',
        status: 'Approved',
        approvedBy: teacher._id,
        approvalDate: new Date()
      }
    ];

    // Insert leave requests
    const created = await TeacherLeaveRequest.insertMany(leaveRequests);
    console.log(`✅ Created ${created.length} sample leave requests:`);
    created.forEach((req, i) => {
      console.log(`   ${i + 1}. ${req.leaveType} (${req.leaveStartDate.toLocaleDateString()} - ${req.leaveEndDate.toLocaleDateString()}) - Status: ${req.status}`);
    });

    console.log('\n✅ Seed complete! Leave requests added to database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedLeaveRequests();

