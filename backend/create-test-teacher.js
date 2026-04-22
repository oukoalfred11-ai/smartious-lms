const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Teacher = require('./src/models/Teacher');
const Subject = require('./src/models/Subject');
const bcrypt = require('bcryptjs');

async function createTestTeacher() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Get some IGCSE subjects
    const subjects = await Subject.find({ curriculum: 'IGCSE' }).limit(3);
    const subjectIds = subjects.map(s => s._id);

    console.log(`\n📚 Found ${subjectIds.length} IGCSE subjects to assign`);

    // Create test teacher in User collection
    const tempPassword = 'Test1234!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const teacher = await User.create({
      firstName: 'Sarah',
      lastName: 'Mathematics',
      email: 'sarah.math@smartious.ac.ke',
      phone: '+254712345678',
      role: 'teacher',
      password: hashedPassword,
      curriculum: 'IGCSE',
      subjects: subjectIds,
      plan: 'Staff',
      isActive: true,
      isDemo: false
    });

    console.log(`\n✓ Created user teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`);

    // Create corresponding Teacher record
    const teacherRecord = await Teacher.create({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      curriculum: teacher.curriculum,
      subjects: subjectIds,
      status: 'Active'
    });

    console.log(`✓ Created Teacher record with ID: ${teacherRecord._id}`);
    console.log(`✓ Teacher assigned to ${subjectIds.length} subjects`);

    // Create another teacher for different curriculum
    const cbcSubjects = await Subject.find({ curriculum: 'Kenya CBC' }).limit(2);
    const cbcSubjectIds = cbcSubjects.map(s => s._id);

    const teacher2 = await User.create({
      firstName: 'William',
      lastName: 'Sciences',
      email: 'william.sciences@smartious.ac.ke',
      phone: '+254712345679',
      role: 'teacher',
      password: hashedPassword,
      curriculum: 'Kenya CBC',
      subjects: cbcSubjectIds,
      plan: 'Staff',
      isActive: true,
      isDemo: false
    });

    console.log(`\n✓ Created user teacher: ${teacher2.firstName} ${teacher2.lastName} (${teacher2.email})`);

    const teacherRecord2 = await Teacher.create({
      firstName: teacher2.firstName,
      lastName: teacher2.lastName,
      email: teacher2.email,
      phone: teacher2.phone || '',
      curriculum: teacher2.curriculum,
      subjects: cbcSubjectIds,
      status: 'Active'
    });

    console.log(`✓ Created Teacher record with ID: ${teacherRecord2._id}`);
    console.log(`✓ Teacher assigned to ${cbcSubjectIds.length} subjects`);

    // Summary
    const allTeachers = await User.find({ role: 'teacher' });
    console.log(`\n📊 Total teachers now: ${allTeachers.length}`);
    allTeachers.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.firstName} ${t.lastName} (${t.email}) - ${t.curriculum} - Demo: ${t.isDemo}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Done!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

createTestTeacher();

