/**
 * Create Teacher Records for Teachers
 * This script creates Teacher records for all users with role='teacher'
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const Teacher = require('./backend/src/models/Teacher');

async function createTeacherRecords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Find all users with role='teacher'
    const teachers = await User.find({ role: 'teacher' });
    console.log(`\nFound ${teachers.length} teacher users`);

    for (const user of teachers) {
      const existingTeacher = await Teacher.findOne({ email: user.email });
      
      if (existingTeacher) {
        console.log(`⏭  Teacher already exists: ${user.email}`);
        continue;
      }

      // Create Teacher record
      const teacherData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        curriculum: user.curriculum || '',
        subjects: user.subjects || [],
        qualifications: [],
        experience: 0,
        status: 'Active',
        userId: user._id,
      };

      const teacher = await Teacher.create(teacherData);
      console.log(`✓ Created Teacher: ${teacher.firstName} ${teacher.lastName}`);
    }

    console.log('\n✅ Teacher records created successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTeacherRecords();

