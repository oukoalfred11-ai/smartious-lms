const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function testTeachersEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Simulate what the /users/teachers/list endpoint does
    const teachers = await User.find({ role: 'teacher' })
      .select('_id firstName lastName email phone curriculum')
      .populate('subjects', 'subjectName curriculum')
      .sort('firstName')
      .limit(500);

    console.log(`\n📊 Teachers returned by endpoint query: ${teachers.length}`);
    teachers.forEach((t, i) => {
      const subjectNames = (t.subjects || []).map(s => typeof s === 'string' ? s : (s.subjectName || s)).join(', ');
      console.log(`  ${i + 1}. ${t.firstName} ${t.lastName} (${t.email})`);
      console.log(`     Curriculum: ${t.curriculum}`);
      console.log(`     Subjects: ${subjectNames || 'None'}`);
      console.log('');
    });

    await mongoose.connection.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

testTeachersEndpoint();

