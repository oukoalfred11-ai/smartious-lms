/**
 * routes/ai-review.js
 * ============================================================
 * Teacher review of AI marking.
 *
 * The loop this closes: the AI suggests a mark, a teacher accepts or
 * overrides it, and the correction is written back to the question so
 * the same question is marked better next year. These questions recur
 * for years, so nothing a teacher decides should be thrown away.
 *
 * Nothing here releases a mark to a student. marksAwarded is only ever
 * written from the teacher's figure, never from the model's.
 *
 *   POST /api/ai-review/submissions/:id/mark   run AI over one submission
 *   GET  /api/ai-review/queue                  submissions awaiting review
 *   GET  /api/ai-review/submissions/:id        one submission, fully expanded
 *   POST /api/ai-review/submissions/:id/answers/:idx/review
 *                                              accept or override one mark
 */
const express = require('express')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const HomeworkSubmission = require('../models/HomeworkSubmission')
const Homework = require('../models/Homework')
const Question = require('../models/Question')
const ai = require('../services/aiMarking')

const ok   = (res, data, message) => res.json({ success: true, data, message })
const fail = (res, code, message) => res.status(code).json({ success: false, message })

const MARKER = requireRole('teacher', 'admin', 'dos')

// ── Resolve the Question behind one answer ──────────────────
// The submission stores an index into the homework's question list,
// so the actual Question has to be looked up through the Homework.
async function questionFor(submission, answer) {
  const hw = await Homework.findById(submission.homeworkId).select('questions').lean()
  if (!hw || !Array.isArray(hw.questions)) return null
  const entry = hw.questions[answer.questionIndex]
  if (!entry) return null
  const qid = entry.questionId || entry._id || entry
  try { return await Question.findById(qid) } catch { return null }
}

// ── POST /submissions/:id/mark ──────────────────────────────
// Run AI marking across every ungraded written answer in a submission.
router.post('/submissions/:id/mark', auth, MARKER, async (req, res) => {
  try {
    if (!ai.isEnabled())
      return fail(res, 503, 'AI marking is off. Set ANTHROPIC_API_KEY and AI_MARKING_ENABLED=true.')

    const sub = await HomeworkSubmission.findById(req.params.id)
    if (!sub) return fail(res, 404, 'Submission not found.')

    let marked = 0, skipped = 0
    const failures = []

    for (const a of sub.answers) {
      // MCQs mark themselves; already-graded answers are left alone.
      if (a.type === 'mcq' || a.marksAwarded !== null) { skipped++; continue }
      const q = await questionFor(sub, a)
      if (!q) { skipped++; continue }

      const answerText = typeof a.answer === 'string' ? a.answer : JSON.stringify(a.answer || '')
      const r = await ai.markAnswer(q._id, answerText)
      if (!r.ok) { failures.push(`Q${a.questionIndex + 1}: ${r.reason}`); continue }

      a.aiSuggestion = {
        marksAwarded:  r.suggestion.marksAwarded,
        feedback:      r.suggestion.feedback,
        confidence:    r.suggestion.confidence,
        schemeless:    !!r.suggestion.schemeless,
        assumedScheme: r.suggestion.assumedScheme || '',
        model:         r.suggestion.model,
        markedAt:      new Date(),
        reviewed:      false,
        teacherAgreed: null,
      }
      marked++
    }
    await sub.save()

    return ok(res, { marked, skipped, failures },
      `AI suggested marks for ${marked} answer${marked === 1 ? '' : 's'}. ` +
      `Every mark still needs your approval.` +
      (failures.length ? ` ${failures.length} could not be marked.` : ''))
  } catch (e) { return fail(res, 500, e.message) }
})

// ── GET /queue ──────────────────────────────────────────────
// Submissions carrying at least one unreviewed AI suggestion.
router.get('/queue', auth, MARKER, async (req, res) => {
  try {
    const { subject, limit = 40 } = req.query
    const filter = {
      status: { $in: ['submitted', 'graded'] },
      'answers.aiSuggestion.markedAt': { $ne: null },
      'answers.aiSuggestion.reviewed': false,
    }
    if (subject) filter.subject = subject

    const subs = await HomeworkSubmission.find(filter)
      .populate('studentId', 'firstName lastName grade')
      .sort({ updatedAt: -1 })
      .limit(Math.min(parseInt(limit) || 40, 100))
      .lean()

    const rows = subs.map(s => {
      const pending = (s.answers || []).filter(a => a.aiSuggestion?.markedAt && !a.aiSuggestion?.reviewed)
      return {
        _id: s._id,
        student: s.studentId
          ? `${s.studentId.firstName || ''} ${s.studentId.lastName || ''}`.trim()
          : 'Unknown',
        grade: s.studentId?.grade || '',
        subject: s.subject || '',
        submittedAt: s.submittedAt || s.updatedAt,
        pendingCount: pending.length,
        // Surfaced so a teacher can start where the AI is least sure.
        lowConfidence: pending.filter(a => a.aiSuggestion.confidence === 'low').length,
        schemeless:    pending.filter(a => a.aiSuggestion.schemeless).length,
      }
    })
    return ok(res, { total: rows.length, submissions: rows })
  } catch (e) { return fail(res, 500, e.message) }
})

// ── GET /submissions/:id ────────────────────────────────────
// One submission with each answer joined to its question and to the
// question's accumulated learning figures.
router.get('/submissions/:id', auth, MARKER, async (req, res) => {
  try {
    const sub = await HomeworkSubmission.findById(req.params.id)
      .populate('studentId', 'firstName lastName grade').lean()
    if (!sub) return fail(res, 404, 'Submission not found.')

    const hw = await Homework.findById(sub.homeworkId).select('questions title').lean()
    const answers = []
    for (const a of (sub.answers || [])) {
      const entry = hw?.questions?.[a.questionIndex]
      const qid = entry?.questionId || entry?._id || entry
      let q = null
      try {
        q = qid ? await Question.findById(qid)
          .select('questionText marks markScheme topic subtopic subject schemeLearning needsMarkScheme figures artwork').lean()
          : null
      } catch { q = null }

      const sl = q?.schemeLearning || {}
      const reviews = (sl.teacherAgreed || 0) + (sl.teacherAdjusted || 0)
      answers.push({
        ...a,
        question: q,
        learning: {
          timesMarked: sl.timesMarked || 0,
          reviews,
          agreementRate: reviews ? Math.round((sl.teacherAgreed || 0) / reviews * 100) : null,
          // Positive means the AI has been marking high on this question.
          averageDelta: reviews ? Number(((sl.marksDelta || 0) / reviews).toFixed(2)) : 0,
          teacherNotes: sl.teacherNotes || [],
          hasScheme: !q?.needsMarkScheme,
        },
      })
    }

    return ok(res, {
      _id: sub._id,
      student: sub.studentId ? `${sub.studentId.firstName || ''} ${sub.studentId.lastName || ''}`.trim() : 'Unknown',
      grade: sub.studentId?.grade || '',
      subject: sub.subject || '',
      homeworkTitle: hw?.title || '',
      status: sub.status,
      answers,
    })
  } catch (e) { return fail(res, 500, e.message) }
})

// ── POST /submissions/:id/answers/:idx/review ───────────────
// The teacher's decision. This is the only path that writes a real
// mark, and the only path that teaches the question anything.
router.post('/submissions/:id/answers/:idx/review', auth, MARKER, async (req, res) => {
  try {
    const { finalMarks, feedback, note } = req.body || {}
    if (finalMarks === undefined || finalMarks === null || finalMarks === '')
      return fail(res, 400, 'finalMarks is required.')

    const sub = await HomeworkSubmission.findById(req.params.id)
    if (!sub) return fail(res, 404, 'Submission not found.')

    const idx = parseInt(req.params.idx, 10)
    const a = sub.answers[idx]
    if (!a) return fail(res, 404, 'Answer not found on this submission.')

    const q = await questionFor(sub, a)
    const outOf = q?.marks ?? null
    const final = Number(finalMarks)
    if (!Number.isFinite(final) || final < 0)
      return fail(res, 400, 'finalMarks must be a number of zero or more.')
    if (outOf !== null && final > outOf)
      return fail(res, 400, `This question is worth ${outOf} mark${outOf === 1 ? '' : 's'}.`)

    const aiMark = a.aiSuggestion?.marksAwarded
    const agreed = Number.isFinite(aiMark) && aiMark === final

    // The teacher's figure is what the student sees.
    a.marksAwarded = final
    if (feedback !== undefined) a.feedback = String(feedback).slice(0, 1000)
    a.autoGraded = false
    if (a.aiSuggestion) {
      a.aiSuggestion.reviewed = true
      a.aiSuggestion.teacherAgreed = agreed
    }
    await sub.save()

    // Teach the question, but only from a suggestion that was reviewed
    // once — re-reviewing the same answer must not skew the figures.
    let learning = null
    if (q && Number.isFinite(aiMark)) {
      const inc = {}
      inc[agreed ? 'schemeLearning.teacherAgreed' : 'schemeLearning.teacherAdjusted'] = 1
      inc['schemeLearning.marksDelta'] = aiMark - final
      const update = { $inc: inc }
      if (note && String(note).trim())
        update.$push = { 'schemeLearning.teacherNotes': String(note).trim().slice(0, 500) }
      await Question.updateOne({ _id: q._id }, update)

      const fresh = await Question.findById(q._id).select('schemeLearning').lean()
      const sl = fresh.schemeLearning || {}
      const reviews = (sl.teacherAgreed || 0) + (sl.teacherAdjusted || 0)
      const rate = reviews ? Math.round((sl.teacherAgreed || 0) / reviews * 100) : null
      learning = {
        reviews, agreementRate: rate,
        averageDelta: reviews ? Number(((sl.marksDelta || 0) / reviews).toFixed(2)) : 0,
        readyToPromote: reviews >= 5 && rate >= 80 && !sl.promoted,
      }
    }

    const remaining = sub.answers.filter(x => x.aiSuggestion?.markedAt && !x.aiSuggestion?.reviewed).length
    return ok(res, { learning, remaining },
      agreed ? 'Mark accepted.' : 'Mark adjusted, and the correction saved against this question.')
  } catch (e) { return fail(res, 500, e.message) }
})

module.exports = router
