/**
 * fix-staff-roles.js
 * One-time script — run then DELETE immediately.
 * Run: node src/fix-staff-roles.js
 *
 * Fixes any user whose role was set to a display label
 * instead of the correct enum value, and lists all staff
 * so you can verify every account is correct.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Map of wrong values → correct enum value
const ROLE_FIX_MAP = {
  // Ops Manager variations
  'operational officer':  'ops_manager',
  'operations manager':   'ops_manager',
  'operations officer':   'ops_manager',
  'ops manager':          'ops_manager',
  'opsmanager':           'ops_manager',
  // Accountant variations
  'accountant':           'accountant',   // already correct but include for check
  'finance':              'accountant',
  'accounts':             'accountant',
  // Sales / Front Desk variations
  'sales':                'sales',        // already correct
  'front desk':           'sales',
  'frontdesk':            'sales',
  'sales officer':        'sales',
  'sales/front desk':     'sales',
  'admissions':           'sales',
  // Admin variations
  'administrator':        'admin',
  'superadmin':           'admin',
  'super admin':          'admin',
}

const VALID_ROLES = ['admin','accountant','sales','ops_manager','teacher','student','parent','demo']

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Bypass Mongoose validation by using updateOne directly
  const db = mongoose.connection.db
  const users = db.collection('users')

  // Fetch all non-student/parent/demo users
  const staff = await users.find({
    role: { $nin: ['student', 'parent', 'demo', 'teacher'] }
  }).toArray()

  console.log('\n=== ALL STAFF ACCOUNTS ===')
  staff.forEach(u => {
    const valid = VALID_ROLES.includes(u.role) ? '✅' : '❌'
    console.log(`${valid} ${u.firstName || ''} ${u.lastName || ''} | ${u.email} | role: "${u.role}" | active: ${u.isActive}`)
  })

  // Fix invalid roles
  const toFix = staff.filter(u => !VALID_ROLES.includes(u.role))
  if (toFix.length === 0) {
    console.log('\n✅ All roles are valid enum values.')
  } else {
    console.log(`\n=== FIXING ${toFix.length} INVALID ROLE(S) ===`)
    for (const u of toFix) {
      const roleLower = (u.role || '').toLowerCase().trim()
      const correctRole = ROLE_FIX_MAP[roleLower]
      if (correctRole) {
        await users.updateOne({ _id: u._id }, { $set: { role: correctRole } })
        console.log(`✅ Fixed ${u.email}: "${u.role}" → "${correctRole}"`)
      } else {
        console.log(`⚠️  ${u.email} has unknown role "${u.role}" — set manually below`)
        console.log(`   Run: db.users.updateOne({email:"${u.email}"},{$set:{role:"ops_manager"}})`)
      }
    }
  }

  // Also catch roles with spaces/capital letters that Mongoose rejected silently
  const allStaff = await users.find({
    role: { $nin: ['student','parent','demo','teacher','admin','accountant','sales','ops_manager'] }
  }).toArray()

  if (allStaff.length > 0) {
    console.log('\n=== STILL-INVALID ROLES (manual fix needed) ===')
    allStaff.forEach(u => console.log(`  ${u.email}: "${u.role}"`))
  }

  console.log('\n=== FINAL STATE ===')
  const final = await users.find({
    role: { $nin: ['student','parent','demo'] }
  }).toArray()
  final.forEach(u => {
    const valid = VALID_ROLES.includes(u.role) ? '✅' : '❌'
    console.log(`${valid} ${u.firstName || ''} ${u.lastName || ''} | ${u.email} | role: "${u.role}"`)
  })

  console.log('\nDone. Delete this file now.')
  await mongoose.disconnect()
  process.exit(0)
}).catch(e => { console.error(e.message); process.exit(1) })
