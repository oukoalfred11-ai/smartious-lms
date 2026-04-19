const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function testStudentsEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Simulate what the /users/students/list endpoint does
    const students = await User.find({ role: 'student' })
      .select('_id firstName lastName email curriculum grade')
      .populate('subjects', 'subjectName curriculum')
      .sort('firstName')
      .limit(500);

    console.log(`\n📊 Students returned: ${students.length}`);
    students.forEach((s, i) => {
      const subjectNames = (s.subjects || []).map(subj => typeof subj === 'string' ? subj : (subj.subjectName || subj)).join(', ');
      console.log(`  ${i + 1}. ${s.firstName} ${s.lastName} (${s.email})`);
      console.log(`     Curriculum: ${s.curriculum}, Grade: ${s.grade}`);
      console.log(`     Subjects (${s.subjects?.length || 0}): ${subjectNames || 'None'}`);
      console.log('');
    });

    // Also test allocations
    const Allocation = require('./src/models/Allocation');
    const allocations = await Allocation.find()
      .populate('studentId', 'firstName lastName')
      .populate('teacherId', 'firstName lastName')
      .populate('subjectId', 'subjectName');
    console.log(`\n📋 Allocations: ${allocations.length}`);
    allocations.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.studentId?.firstName} ${a.studentId?.lastName} -> ${a.teacherId?.firstName} ${a.teacherId?.lastName} (${a.subjectId?.subjectName})`);
    });

    await mongoose.connection.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

testStudentsEndpoint();

