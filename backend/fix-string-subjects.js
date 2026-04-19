const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function fixStringSubjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected\n');

    // Find users with string subjects
    const usersWithStringSubjects = await User.find({
      subjects: { $exists: true }
    }).lean();

    const toFix = [];
    for (const user of usersWithStringSubjects) {
      if (user.subjects && user.subjects.length > 0) {
        const hasStrings = user.subjects.some(s => typeof s === 'string');
        if (hasStrings) {
          toFix.push(user);
        }
      }
    }

    if (toFix.length === 0) {
      console.log('✓ No users with string subjects found. Database is clean!');
      await mongoose.connection.close();
      return;
    }

    console.log(`Found ${toFix.length} user(s) with string subjects:\n`);
    toFix.forEach(user => {
      console.log(`• ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`  Subjects: ${JSON.stringify(user.subjects)}`);
    });

    console.log('\n═════════════════════════════════════════');
    console.log('Fixing string subjects to empty array...');
    console.log('═════════════════════════════════════════\n');

    for (const user of toFix) {
      // Convert string subjects to empty array for demo users
      // (We can't match them to real subjects without knowing what they meant)
      await User.findByIdAndUpdate(user._id, { subjects: [] });
      console.log(`✓ Fixed ${user.firstName} ${user.lastName} - set subjects to []`);
    }

    // Verify the fix
    const verification = await User.find({
      _id: { $in: toFix.map(u => u._id) }
    }).select('firstName lastName subjects');

    console.log('\nVerification - After fix:');
    verification.forEach(user => {
      console.log(`• ${user.firstName} ${user.lastName}: ${user.subjects.length} subjects`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database fixed and cleaned!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

fixStringSubjects();

