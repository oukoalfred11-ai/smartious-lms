/**
 * audit-student.js
 * Read-only audit of one student's portal: why modules or subjects do not
 * load. Finds the student by name or email, checks the account (anything
 * the sign-in layer rejects), their subject allocations (the subjects list
 * only shows Active allocations whose teacher account is active), lessons,
 * timetable and classes, then calls every endpoint the student portal
 * loads, as the student, and reports each status and error.
 *
 * Usage (Render shell, from backend/):
 *   node audit-student.js Brooke
 *   node audit-student.js brooke@example.com
 *   node audit-student.js "Brooke Smith" --api http://localhost:10000
 *
 * Nothing is changed, except that calling the API as the student stamps
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
const problems = []
const flag = (s) => { problems.push(s); bad(s) }

async function main() {
  if (!query) { console.log('Usage: node audit-student.js <name or email>'); process.exit(1) }
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI is not set.'); process.exit(1) }
  await mongoose.connect(process.env.MONGODB_URI)
  const User = require('./src/models/User')
  const Allocation = require('./src/models/Allocation')
  const Lesson = require('./src/models/Lesson')
  const LiveClass = require('./src/models/LiveClass')
  const TimetableEntry = require('./src/models/TimetableEntry')

  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '.*'), 'i')
  const matches = await User.find({ role: 'student', $or: [{ email: re }, { firstName: re }, { lastName: re }, { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: re } } }] })
    .select('-password').lean()
  if (!matches.length) { console.log(`No student matches "${query}".`); return }
  if (matches.length > 1) {
    console.log(`${matches.length} students match "${query}" — auditing each:`)
    matches.forEach(m => console.log(`  ${m.firstName} ${m.lastName} <${m.email}> ${m._id}`))
  }

  for (const st of matches) {
    problems.length = 0
    console.log(`\n══ ${st.firstName} ${st.lastName} <${st.email}> (${st._id}) ══`)

    // ── 1. Account ──
    console.log('\n1. Account')
    info(`curriculum: ${JSON.stringify(st.curriculum)} · grade: ${JSON.stringify(st.gradeLevel)} · programme: ${st.programme || '-'} · mode: ${st.deliveryMode || '(unset = Virtual)'}`)
    info(`status: ${st.studentStatus || '-'} · isActive: ${st.isActive} · archived: ${!!st.archived} · onBreak: ${!!st.onBreak}${st.onBreak ? ' (' + st.breakType + ', blocks access: ' + !!st.breakBlocksAccess + ')' : ''}`)
    if (st.isActive === false) flag('Account is deactivated (isActive false): every portal request is refused with "Account deactivated", so no module loads.')
    if (st.archived) flag('Account is archived (marked left or graduated).')
    if (st.onBreak && st.breakBlocksAccess) flag('A pause that blocks access is active: the portal shows the paused screen.')
    if (st.mustChangePassword) info('mustChangePassword is set: the student is asked to change the password first.')
    if (!st.curriculum) flag('No curriculum set: curriculum-based pages (spine, quizzes, progress) have nothing to show.')
    if (!st.gradeLevel) flag('No grade level set.')
    if (st.subjects && !Array.isArray(st.subjects)) flag(`"subjects" is not a list (${typeof st.subjects}): ${JSON.stringify(st.subjects).slice(0, 120)}`)
    if (!problems.length) ok('No account flag blocks the portal.')

    // ── 2. Subjects (allocations) ──
    console.log('\n2. Subjects (allocations: the student’s subject list)')
    const allocs = await Allocation.find({ studentId: st._id })
      .populate('subjectId', 'subjectName curriculum').populate('teacherId', 'firstName lastName isActive isOnLeave email').lean()
    if (!allocs.length) flag('No allocations at all: the student has no subjects, so "My subjects"/lessons is empty. Allocate subjects and teachers.')
    let shown = 0
    for (const a of allocs) {
      const why = []
      if (a.status !== 'Active') why.push(`status is "${a.status}", not Active`)
      if (!a.subjectId) why.push('the subject no longer exists')
      if (!a.teacherId) why.push('no teacher (or the teacher account was deleted)')
      else if (!a.teacherId.isActive) why.push(`teacher ${a.teacherId.firstName} ${a.teacherId.lastName} is deactivated`)
      const name = a.subjectId ? `${a.subjectId.subjectName} (${a.subjectId.curriculum})` : String(a.subjectId)
      if (why.length) flag(`${name}: HIDDEN — ${why.join('; ')}`)
      else {
        shown++
        const lessons = await Lesson.countDocuments({ subjectId: a.subjectId._id, status: 'published' })
        ok(`${name} — teacher ${a.teacherId.firstName} ${a.teacherId.lastName}${a.teacherId.isOnLeave ? ' (on leave)' : ''} — ${lessons} published lesson(s)`)
        if (!lessons) flag(`${a.subjectId.subjectName}: no published lessons, so the subject opens empty.`)
        if (a.subjectId.curriculum && st.curriculum && !String(a.subjectId.curriculum).toLowerCase().includes(String(st.curriculum).toLowerCase().split(/[\s-]/)[0]))
          info(`note: subject curriculum "${a.subjectId.curriculum}" differs from the student's "${st.curriculum}"`)
      }
    }
    if (allocs.length) info(`${shown} of ${allocs.length} allocation(s) show in the portal.`)

    // ── 2b. "My Curriculum" page ──
    // Its subject cards come from the student record (curriculum + subjects),
    // not from allocations: both must be set or the page shows no subjects.
    console.log('\n2b. "My Curriculum" page (subject cards from the student record)')
    const recSubjects = Array.isArray(st.subjects) ? st.subjects.filter(Boolean).map(String) : []
    if (!st.curriculum || !recSubjects.length) flag(`The curriculum page shows no subject cards: ${!st.curriculum ? 'curriculum is empty' : ''}${!st.curriculum && !recSubjects.length ? ' and ' : ''}${!recSubjects.length ? 'the student record has no subjects listed' : ''}. Add the subjects on the student's profile.`)
    else ok(`${recSubjects.length} subject card(s): ${recSubjects.join(', ')}`)
    const allocNames = allocs.filter(a => a.subjectId).map(a => a.subjectId.subjectName)
    const norm = (x) => String(x).toLowerCase().replace(/\(.*?\)|\b(hl|sl|igcse|as|a level|a-level)\b/g, '').replace(/[^a-z]/g, '')
    const missingCards = allocNames.filter(n => !recSubjects.some(r => norm(r) === norm(n)))
    if (recSubjects.length && missingCards.length) info(`allocated but not on the record (no card): ${missingCards.join(', ')}`)

    // ── 3. Classes and timetable ──
    console.log('\n3. Classes and timetable')
    const now = new Date()
    const [upcoming, past, slots] = await Promise.all([
      LiveClass.countDocuments({ assignedStudents: st._id, status: 'scheduled', scheduledAt: { $gte: now } }),
      LiveClass.countDocuments({ assignedStudents: st._id, scheduledAt: { $lt: now } }),
      TimetableEntry.countDocuments({ assignedStudents: st._id, isActive: { $ne: false } }),
    ])
    info(`upcoming lessons: ${upcoming} · past lessons: ${past} · active timetable slots: ${slots}`)
    if (!slots) flag('No active timetable slots: the timetable is empty and no new lessons are generated.')
    if (!upcoming) flag('No upcoming lessons scheduled.')

    // ── 4. Every portal endpoint, called as the student ──
    console.log(`\n4. Portal endpoints, as the student (${API})`)
    if (!process.env.JWT_SECRET) { flag('JWT_SECRET is not set here, so the endpoints cannot be called.'); continue }
    const token = jwt.sign({ id: st._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '10m' })
    const curriculum = encodeURIComponent(st.curriculum || '')
    const endpoints = [
      '/auth/me', '/student-profile/me', '/notifications/mine', '/liveclasses/student/list', '/timetable/me',
      '/homework/student/list', '/exams/student/list', '/exams/submissions/my', '/lessons/student/my-subjects',
      '/lesson-progress/my', '/communication/student/recipients', '/communication/student/history',
      '/announcements/hero-video', '/library', '/community/posts', `/subjects?curriculum=${curriculum}`,
      `/attendance/student/${st._id}`, '/quiz/leaderboard', `/quiz/achievements/${st._id}`,
      '/admission-documents/mine', '/lab/experiments', '/lab/sessions/mine', '/lab/assignments',
    ]
    for (const path of endpoints) {
      const t0 = Date.now()
      try {
        const r = await fetch(API + '/api' + path, { headers: { Authorization: 'Bearer ' + token } })
        const ms = Date.now() - t0
        let body = null; try { body = await r.json() } catch {}
        const d = body?.data
        const size = Array.isArray(d) ? d.length : d && typeof d === 'object' ? Object.entries(d).filter(([, v]) => Array.isArray(v)).map(([k, v]) => `${k}:${v.length}`).join(' ') : ''
        if (r.ok) ok(`${r.status} ${path} ${ms}ms ${size}`)
        else flag(`${r.status} ${path} — ${body?.message || r.statusText}${body?.code ? ' [' + body.code + ']' : ''}`)
        if (r.ok && ms > 8000) flag(`${path} took ${ms}ms: slow enough to look like it never loads.`)
      } catch (e) {
        flag(`${path} — request failed: ${e.message}${/ECONNREFUSED/.test(e.message) ? ' (is the API at ' + API + '? pass --api https://<your-backend>.onrender.com)' : ''}`)
      }
    }
    // Each visible subject's lessons
    const subj = allocs.filter(a => a.status === 'Active' && a.subjectId && a.teacherId?.isActive)
    for (const a of subj) {
      const path = '/lessons/student/subject/' + a.subjectId._id
      try {
        const r = await fetch(API + '/api' + path, { headers: { Authorization: 'Bearer ' + token } })
        const body = await r.json().catch(() => null)
        if (r.ok) ok(`${r.status} ${a.subjectId.subjectName} lessons`)
        else flag(`${r.status} ${a.subjectId.subjectName} lessons — ${body?.message || r.statusText}`)
      } catch (e) { flag(`${path} — ${e.message}`) }
    }

    console.log(`\n── Summary for ${st.firstName} ${st.lastName}: ${problems.length ? problems.length + ' problem(s)' : 'no problems found'}`)
    problems.forEach((p, i) => console.log(`  ${i + 1}. ${p}`))
  }
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
