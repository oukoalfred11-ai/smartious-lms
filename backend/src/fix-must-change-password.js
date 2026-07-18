/**
 * fix-must-change-password.js
 * Run ONCE on Render to clear mustChangePassword for all staff roles.
 *
 * Usage: add this file to backend/src/ then temporarily add to index.js:
 *   require('./fix-must-change-password')
 * Remove the require line after one successful deploy.
 */

const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('[fix] MONGODB_URI not set')
  process.exit(1)
}

mongoose.connect(MONGODB_URI).then(async () => {
  const STAFF_ROLES = ['admin', 'teacher', 'ops_manager', 'accountant', 'sales']

  const result = await mongoose.connection.db.collection('users').updateMany(
    {
      role: { $in: STAFF_ROLES },
      mustChangePassword: true,
    },
    {
      $set: { mustChangePassword: false },
    }
  )

  console.log(`[fix] Updated ${result.modifiedCount} staff accounts — mustChangePassword set to false`)
  process.exit(0)
}).catch(e => {
  console.error('[fix] DB error:', e.message)
  process.exit(1)
})
