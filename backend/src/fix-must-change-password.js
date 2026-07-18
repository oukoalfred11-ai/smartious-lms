/**
 * fix-must-change-password.js
 * Safe version — no process.exit() so server keeps running.
 * Remove the require() line from index.js after first deploy.
 */
const mongoose = require('mongoose')

setTimeout(async () => {
  try {
    const STAFF_ROLES = ['admin', 'teacher', 'ops_manager', 'accountant', 'sales']
    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: { $in: STAFF_ROLES }, mustChangePassword: true },
      { $set: { mustChangePassword: false } }
    )
    console.log(`[fix] mustChangePassword cleared for ${result.modifiedCount} staff accounts`)
  } catch(e) {
    console.error('[fix] migration error:', e.message)
  }
}, 3000) // wait 3s for DB to be ready
