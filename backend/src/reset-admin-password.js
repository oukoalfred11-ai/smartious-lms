require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const TARGET_EMAIL = 'oukoalfredelliot@gmail.com';
const NEW_PASSWORD = 'Yukabeth@2026';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');

  const user = await User.findOne({ email: TARGET_EMAIL });
  if (!user) { console.error('User not found'); process.exit(1); }
  console.log('Found:', user.firstName, user.lastName);

  // Bypass Mongoose entirely — write the hash directly to MongoDB
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  console.log('Hash generated:', hash.substring(0, 20) + '...');

  // Verify hash works before writing
  const preCheck = await bcrypt.compare(NEW_PASSWORD, hash);
  console.log('Pre-write check:', preCheck ? '✅ hash is valid' : '❌ hash broken');

  // Write directly via updateOne — bypasses all Mongoose hooks
  const result = await User.collection.updateOne(
    { _id: user._id },
    { $set: { password: hash } }
  );
  console.log('MongoDB write result:', result.modifiedCount, 'doc(s) modified');

  // Read back and verify
  const raw = await User.collection.findOne({ _id: user._id });
  const postCheck = await bcrypt.compare(NEW_PASSWORD, raw.password);
  console.log('Post-write stored hash:', raw.password.substring(0, 20) + '...');
  console.log('Final check:', postCheck ? '✅ SUCCESS — login now works' : '❌ STILL FAILED');

  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
