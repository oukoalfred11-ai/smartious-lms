/**
 * routes/ratings.js
 * Teacher ratings by students and parents.
 * Mounted at /api/ratings
 *
 * POST /api/ratings               — submit a rating (student/parent)
 * GET  /api/ratings/teacher/:id   — get ratings for a teacher
 * GET  /api/ratings/my            — teacher sees their own rating summary
 * GET  /api/ratings/all           — COO/admin sees all teachers + ratings
 * POST /api/ratings/show-cause/:teacherId — apply show-cause deduction
 */
const express = require('express')
const router  = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const TeacherRating = require('../models/TeacherRating')
const User          = require('../models/User')

const ok   = (res,data,msg) => res.json({ success:true, data, message:msg })
const fail = (res,code,msg) => res.status(code).json({ success:false, message:msg })

// ── POST /api/ratings — submit or update a rating ────────
router.post('/', auth, requireRole('student','parent'), async (req, res) => {
  try {
    const { teacherId, score, comment } = req.body
    if (!teacherId) return fail(res,400,'teacherId required.')
    if (!score || score < 1 || score > 5) return fail(res,400,'Score must be 1–5.')

    const teacher = await User.findById(teacherId).select('firstName lastName role').lean()
    if (!teacher || teacher.role !== 'teacher') return fail(res,404,'Teacher not found.')

    const raterName = req.user.firstName + ' ' + req.user.lastName

    const existing = await TeacherRating.findOne({ teacherId, raterId:req.user._id })
    if (existing) {
      existing.score   = score
      existing.comment = comment || ''
      existing.raterName = raterName
      await existing.save()
      const summary = await TeacherRating.avgForTeacher(teacherId)
      return ok(res, { summary }, 'Rating updated.')
    }

    await TeacherRating.create({
      teacherId, raterId:req.user._id,
      raterRole: req.user.role,
      raterName, score, comment: comment||'',
    })
    const summary = await TeacherRating.avgForTeacher(teacherId)
    return ok(res, { summary }, 'Rating submitted. Thank you!')
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/ratings/my — teacher's own rating ───────────
router.get('/my', auth, requireRole('teacher'), async (req, res) => {
  try {
    const summary  = await TeacherRating.avgForTeacher(req.user._id)
    const ratings  = await TeacherRating.find({ teacherId:req.user._id })
      .sort({ createdAt:-1 })
      .select('score comment raterRole raterName createdAt showCauseDeductions')
      .lean()
    return ok(res, { summary, ratings })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/ratings/all — COO/admin all teachers ────────
router.get('/all', auth, requireRole('admin','ops_manager','dos'), async (req, res) => {
  try {
    const teachers = await User.find({ role:'teacher', isActive:true })
      .select('firstName lastName email subjects curriculum jobTitle')
      .lean()

    const results = await Promise.all(teachers.map(async t => {
      const summary = await TeacherRating.avgForTeacher(t._id)
      const showCauses = await TeacherRating.find({ teacherId:t._id, 'showCauseDeductions.0':{ $exists:true } }).lean()
      const totalDeductions = showCauses.reduce((s,r)=>s+(r.showCauseDeductions||[]).reduce((d,x)=>d+x.amount,0),0)
      return { ...t, rating: summary.avg, ratingCount: summary.count, rawRating: summary.rawAvg, totalDeductions: Math.round(totalDeductions*10)/10, breakdown: summary.breakdown }
    }))

    return ok(res, { teachers: results })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/ratings/teacher/:id ─────────────────────────
router.get('/teacher/:id', auth, requireRole('admin','ops_manager','dos','teacher'), async (req, res) => {
  try {
    // Teacher can only see their own
    if (req.user.role === 'teacher' && String(req.user._id) !== req.params.id)
      return fail(res,403,'Not allowed.')
    const summary = await TeacherRating.avgForTeacher(req.params.id)
    const ratings = await TeacherRating.find({ teacherId:req.params.id })
      .sort({ createdAt:-1 }).select('score comment raterRole raterName createdAt showCauseDeductions').lean()
    return ok(res, { summary, ratings })
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/ratings/show-cause/:teacherId ───────────────
// COO/admin applies a show-cause deduction to a teacher's rating
router.post('/show-cause/:teacherId', auth, requireRole('admin','ops_manager'), async (req, res) => {
  try {
    const { reason, amount = 0.3 } = req.body
    const teacher = await User.findById(req.params.teacherId).select('firstName lastName email').lean()
    if (!teacher) return fail(res,404,'Teacher not found.')

    // Add deduction to a synthetic rating entry for this teacher (from ops_manager)
    let existing = await TeacherRating.findOne({ teacherId:req.params.teacherId, raterId:req.user._id })
    if (!existing) {
      existing = await TeacherRating.create({
        teacherId: req.params.teacherId, raterId: req.user._id,
        raterRole: 'parent', raterName: 'System', score: 5, comment: '',
      })
    }
    existing.showCauseDeductions.push({ amount: parseFloat(amount)||0.3, reason: reason||'Show cause issued', date: new Date() })
    await existing.save()

    const summary = await TeacherRating.avgForTeacher(req.params.teacherId)
    return ok(res, { summary }, `Show-cause deduction applied. New rating: ${summary.avg}/5`)
  } catch(e) { return fail(res,500,e.message) }
})

module.exports = router
