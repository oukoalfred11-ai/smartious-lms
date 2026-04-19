const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const teachers = await User.find({ role: 'teacher' }).select('firstName lastName createdAt').sort('firstName').limit(5);
    console.log('\nTeachers with createdAt:');
    teachers.forEach(t => {
      const date = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
      console.log(`  ${t.firstName} ${t.lastName}: ${date}`);
    });
    await mongoose.connection.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();

