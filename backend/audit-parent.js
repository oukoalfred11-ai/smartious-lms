/**
 * audit-parent.js
 * Read-only audit of one parent's portal: why it shows blank or no
 * children. Finds the parent by name or email, checks the account, every
 * way a child can be linked (and links to deleted accounts), then calls
 * the endpoints the parent portal loads, as the parent, for each child.
 *
 * Usage (Render shell, from backend/):
 *   node audit-parent.js Jurijs
 *   node audit-parent.js jurijs@example.com --api http://localhost:10000
 *
 * Nothing is changed, except that calling the API as the parent stamps
 * their "last active" time, as any page load would.
 */
require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const args = process.argv.slice(2)
const apiArg = args.indexOf('--api')
const API = (apiArg >= 0 ? args[apiArg + 1] : '') || process.env.AUDIT_API || `http://localhost:${process.env.PORT || 5000}`
// Without --api, apiArg is -1: skip nothing (apiArg + 1 would drop the first word).
const query = args.filter((a, i) => apiArg < 0 || (i !== apiArg && i !== apiArg + 1)).join(' ').trim()
const ok = (s) => console.log('  ✓ ' + s)
const bad = (s) => console.log('  ✗ ' + s)
const info = (s) => console.log('    ' + s)

async function main() {
  if (!query) { console.log('Usage: node audit-parent.js <name or email>'); process.exit(1) }
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI is not set.'); process.exit(1) }
  await mongoose.connect(process.env.MONGODB_URI)
  const User = require('./src/models/User')
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '.*'), 'i')
  const people = await User.find({ $or: [{ email: re }, { firstName: re }, { lastName: re },
    { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: re } } }] })
    .select('-password').lean()
  if (!people.length) { console.log(`Nobody matches "${query}".`); return }
  const parents = people.filter(p => p.role === 'parent')
  people.filter(p => p.role !== 'parent').forEach(p => info(`(also matches ${p.role} ${p.firstName} ${p.lastName} <${p.email}>)`))
  if (!parents.length) { console.log(`No PARENT account matches "${query}". A parent signing in with a non-parent account is sent to another portal.`); return }

  for (const p of parents) {
    console.log(`\n══ ${p.firstName} ${p.lastName} <${p.email}> (${p._id}) ══`)
    console.log('\n1. Account')
    info(`role: ${p.role} · isActive: ${p.isActive} · archived: ${!!p.archived} · mustChangePassword: ${!!p.mustChangePassword}`)
    if (p.isActive === false) bad('Account is deactivated: every request is refused.')

    console.log('\n2. Children, by every kind of link')
    const listed = [...(p.linkedStudents || []), ...(p.children || [])].map(String)
    const found = await User.find({ _id: { $in: listed } }).select('firstName lastName role archived studentStatus').lean()
    for (const id of listed) {
      const s = found.find(x => String(x._id) === id)
      if (!s) bad(`linked id ${id} → account no longer exists (this used to crash the portal into a blank page)`)
      else if (s.role !== 'student') bad(`linked id ${id} → ${s.firstName} ${s.lastName} is a ${s.role}, not a student`)
      else ok(`linked: ${s.firstName} ${s.lastName}${s.archived ? ' (archived)' : ''}${s.studentStatus ? ' · ' + s.studentStatus : ''}`)
    }
    if (!listed.length) info('no children on the parent record (linkedStudents / children)')
    const viaStudent = await User.find({ role: 'student', linkedParents: p._id }).select('firstName lastName').lean()
    viaStudent.forEach(s => ok(`student record lists this parent: ${s.firstName} ${s.lastName}`))
    const viaEmail = await User.find({ role: 'student', parentEmail: new RegExp('^' + String(p.email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }).select('firstName lastName parentEmail').lean()
    viaEmail.forEach(s => ok(`parentEmail matches: ${s.firstName} ${s.lastName}${s.parentEmail !== p.email ? ' (different letter case: ' + s.parentEmail + ')' : ''}`))

    console.log(`\n3. Portal endpoints, as the parent (${API})`)
    if (!process.env.JWT_SECRET) { bad('JWT_SECRET is not set here.'); continue }
    const token = jwt.sign({ id: p._id, role: 'parent' }, process.env.JWT_SECRET, { expiresIn: '10m' })
    const call = async (path) => {
      const t0 = Date.now()
      try {
        const r = await fetch(API + '/api' + path, { headers: { Authorization: 'Bearer ' + token } })
        const body = await r.json().catch(() => null)
        if (r.ok) ok(`${r.status} ${path} ${Date.now() - t0}ms`); else bad(`${r.status} ${path} — ${body?.message || r.statusText}`)
        return body
      } catch (e) { bad(`${path} — ${e.message}${/ECONNREFUSED/.test(e.message) ? ' (pass --api https://<your-backend>.onrender.com)' : ''}`); return null }
    }
    await call('/auth/me')
    const kids = (await call('/parent/children'))?.data?.children || []
    info(`children the portal receives: ${kids.length ? kids.map(k => k ? `${k.firstName} ${k.lastName}` : 'NULL (crashes the portal)').join(', ') : 'none (portal shows "No student linked yet")'}`)
    for (const k of kids.filter(Boolean)) {
      console.log(`   ${k.firstName} ${k.lastName}:`)
      for (const s of ['reports', 'fees', 'timetable', 'homework', 'liveclasses', 'attendance', 'results', 'teachers']) await call(`/parent/children/${k._id}/${s}`)
    }
  }
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
