const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Teacher = require('./src/models/Teacher');
const Subject = require('./src/models/Subject');

async function checkTeachers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Count teachers in User collection
    const userTeachers = await User.find({ role: 'teacher' }).select('firstName lastName email curriculum subjects').populate('subjects', 'subjectName');
    console.log(`\n📊 Teachers in User collection: ${userTeachers.length}`);
    userTeachers.forEach((t, i) => {
      const subjectsCount = t.subjects ? t.subjects.length : 0;
      console.log(`  ${i + 1}. ${t.firstName} ${t.lastName} (${t.email}) - ${t.curriculum} - ${subjectsCount} subjects`);
    });

    // Count teachers in Teacher collection
    const teachers = await Teacher.find().select('firstName lastName email curriculum subjects').populate('subjects', 'subjectName');
    console.log(`\n📊 Teachers in Teacher collection: ${teachers.length}`);
    teachers.forEach((t, i) => {
      const subjectsCount = t.subjects ? t.subjects.length : 0;
      console.log(`  ${i + 1}. ${t.firstName} ${t.lastName} (${t.email}) - ${t.curriculum} - ${subjectsCount} subjects`);
    });

    // Check if they have isDemo flag
    const demoTeachers = await User.find({ role: 'teacher', isDemo: true });
    console.log(`\n🎭 Demo teachers: ${demoTeachers.length}`);

    const activeTeachers = await User.find({ role: 'teacher', isDemo: false });
    console.log(`👤 Real teachers: ${activeTeachers.length}`);

    await mongoose.connection.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

checkTeachers();

