/**
 * Script to enroll test students in subjects
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function enrollStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Amara Osei - IGCSE student
    const amara = await User.findOne({ email: 'amara.osei@student.smartious.ac.ke' });
    if (amara) {
      const igcseSubjects = await Subject.find({ curriculum: 'IGCSE' }).limit(5);
      amara.subjects = igcseSubjects.map(s => s._id);
      await amara.save();
      console.log(`✓ Enrolled Amara in ${igcseSubjects.length} IGCSE subjects`);
    }

    // Kofi Mensah - A-Level student
    const kofi = await User.findOne({ email: 'kofi.mensah@student.smartious.ac.ke' });
    if (kofi) {
      const aLevelSubjects = await Subject.find({ curriculum: 'A-Level' }).limit(4);
      kofi.subjects = aLevelSubjects.map(s => s._id);
      await kofi.save();
      console.log(`✓ Enrolled Kofi in ${aLevelSubjects.length} A-Level subjects`);
    }

    // Faith Wanjiru - IGCSE student
    const faith = await User.findOne({ email: 'faith.w@student.smartious.ac.ke' });
    if (faith) {
      const igcseSubjects = await Subject.find({ curriculum: 'IGCSE' }).limit(6);
      faith.subjects = igcseSubjects.map(s => s._id);
      await faith.save();
      console.log(`✓ Enrolled Faith in ${igcseSubjects.length} IGCSE subjects`);
    }

    // Also add a teaching specialty to James Muthomi
    const james = await User.findOne({ email: 'j.muthomi@smartious.ac.ke' });
    if (james) {
      const mathSubject = await Subject.findOne({ curriculum: 'IGCSE', subjectName: 'Mathematics' });
      if (mathSubject) {
        james.teachingSpecialties = [
          {
            subjectId: mathSubject._id,
            curriculum: 'IGCSE'
          }
        ];
        await james.save();
        console.log(`✓ Added Mathematics (IGCSE) specialty to James`);
      }
    }

    console.log('\n✓ Student enrollment complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

enrollStudents();

