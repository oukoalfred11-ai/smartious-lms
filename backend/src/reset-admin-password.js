/**
 * reset-admin-password.js
 * ============================================================
 * One-time script to reset the admin password.
 * Run on Render via the Shell tab:
 *   node src/reset-admin-password.js
 *
 * DELETE THIS FILE after running.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const TARGET_EMAIL   = 'oukoalfredelliot@gmail.com';
const NEW_PASSWORD   = 'Yukabeth@2026';

if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

mongoose.connect(MONGODB_URI).then(async () => {
  const User = require('./models/User');

  const user = await User.findOne({ email: TARGET_EMAIL });
  if (!user) {
    console.error('No user found with email:', TARGET_EMAIL);
    process.exit(1);
  }

  console.log('Found user:', user.firstName, user.lastName, '| role:', user.role);

  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  user.password = hash;
  await user.save();

  // Verify immediately
  const fresh = await User.findById(user._id);
  const ok = await bcrypt.compare(NEW_PASSWORD, fresh.password);
  console.log('Password reset:', ok ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Login with:', TARGET_EMAIL, '/', NEW_PASSWORD);

  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('DB error:', err.message);
  process.exit(1);
});
