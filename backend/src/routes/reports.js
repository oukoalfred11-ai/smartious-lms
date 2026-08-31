/**
 * routes/reports.js
 * Academic report generation, storage and PDF download.
 * Mounted at /api/reports
 */
const express = require('express')
const router  = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const ALLOWED = requireRole('admin', 'ops_manager', 'accountant', 'dos')

const Report   = require('../models/Report')
const User     = require('../models/User')
const Exam     = require('../models/Exam')
const ExamSubmission = require('../models/ExamSubmission')
const Attendance = require('../models/Attendance')

// ── Grading helper ──────────────────────────────────────────
function toLetterGrade(score) {
  if (score === null || score === undefined) return '—'
  if (score >= 80) return 'A*'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  if (score >= 40) return 'E'
  return 'U'
}

function gradeLabel(g) {
  const MAP = {
    'A*': 'Excellent — exceeds level expectations',
    'A':  'Excellent — exceeds level expectations',
    'B':  'Very good — secure command',
    'C':  'Good — meets expectations',
    'D':  'Satisfactory — developing',
    'E':  'Needs support — targeted intervention',
    'U':  'Ungraded — foundation rebuild required',
  }
  return MAP[g] || ''
}

// ── GET /api/reports ────────────────────────────────────────
router.get('/', auth, ALLOWED, async (req, res) => {
  try {
    const { studentId, academicYear, term, status, page = 1, limit = 30 } = req.query
    const filter = {}
    if (studentId) filter.studentId = studentId
    if (academicYear) filter.academicYear = academicYear
    if (term) filter.term = parseInt(term)
    if (status) filter.status = status
    const p = Math.max(1, parseInt(page) || 1), lim = Math.min(100, parseInt(limit) || 30)
    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).skip((p-1)*lim).limit(lim)
        .populate('studentId','firstName lastName admissionNo').lean(),
      Report.countDocuments(filter),
    ])
    return res.json({ success: true, data: { reports, total, page: p, totalPages: Math.ceil(total/lim) } })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/reports/:id ────────────────────────────────────
router.post('/teacher-save', auth, requireRole('admin','ops_manager','dos','accountant','teacher'), async (req, res) => {
  try {
    const { studentId, studentName, subject, period, classLevel, topics, subTopics,
            activities, understanding, participation, generalPerf, strengths,
            improvements, assessments, homework, remarks, week, publish } = req.body

    let student = null
    if (studentId) student = await User.findById(studentId).select('firstName lastName email parentEmail linkedParents curriculum gradeLevel').lean()
    const sName = student ? `${student.firstName} ${student.lastName}` : (studentName||'')
    if (!sName) return res.status(400).json({ success:false, message:'Student name required.' })

    const termNum = period?(period.includes('1')?1:period.includes('2')?2:3):1
    const yearStr = new Date().getFullYear()+'/'+(new Date().getFullYear()+1)

    let report = await Report.findOne({ teacherId:req.user._id, studentName:sName, subject, term:termNum, academicYear:yearStr })

    const scores = (assessments||[]).filter(a=>a.desc||a.score).map(a=>({
      subject, topic:a.desc||'', score:parseFloat(a.score)||0, outOf:parseFloat(a.outOf)||100,
      percentage:a.outOf?Math.round((parseFloat(a.score)/parseFloat(a.outOf))*100):0,
      grade:'', teacherRemark:remarks||'',
    }))
    const avg = scores.length?Math.round(scores.reduce((s,r)=>s+(r.percentage||0),0)/scores.length):null

    const data = {
      teacherId:req.user._id, studentId:student?._id||null, studentName:sName,
      subject, curriculum:student?.curriculum||classLevel||'', yearGrade:student?.gradeLevel||classLevel||'',
      academicYear:yearStr, term:termNum, status:publish?'published':'draft',
      subjectScores:scores, overallAverage:avg,
      meanGrade:avg!==null?(avg>=80?'A*':avg>=70?'A':avg>=60?'B':avg>=50?'C':avg>=40?'D':'E'):null,
      overallRemark:avg!==null?(avg>=80?'Excellent':avg>=70?'Very Good':avg>=60?'Good':avg>=50?'Satisfactory':'Needs Improvement'):null,
      hodRemarks:remarks||'',
      weeklyData:{ week, period, classLevel, topics, subTopics, activities, understanding, participation, generalPerf, strengths, improvements, homework, remarks },
    }

    if (report) { Object.assign(report, data); await report.save() }
    else { report = await Report.create(data) }

    let notified = 0
    if (publish && student) { try { notified = await notifyParentReportReady(report, student) } catch {} }

    return res.json({ success:true, message:publish?`Report published.${notified?' Parent notified.':''}`:'Draft saved.', data:{ report } })
  } catch(e) { console.error('[teacher-save]',e.message); return res.status(500).json({ success:false, message:e.message }) }
})

router.get('/my-saved', auth, requireRole('admin','teacher','dos','ops_manager'), async (req, res) => {
  try {
    const filter = req.user.role==='teacher' ? { teacherId:req.user._id } : {}
    const reports = await Report.find(filter).sort({ updatedAt:-1 })
      .select('studentName subject academicYear term status overallAverage meanGrade updatedAt studentId curriculum yearGrade').lean()
    return res.json({ success:true, data:{ reports } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

router.post('/:id/publish', auth, requireRole('admin','ops_manager','dos','accountant','teacher'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('studentId','firstName lastName email parentEmail linkedParents')
    if (!report) return res.status(404).json({ success:false, message:'Report not found.' })
    report.status = 'published'
    await report.save()
    let notified = 0
    try { notified = await notifyParentReportReady(report) } catch(e) { console.error('[report notify]', e.message) }
    return res.json({ success:true, message:`Report published.${notified?' Parent notified.':''}`, data:{ report } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

router.get('/:id', auth, requireRole('admin','ops_manager','accountant','teacher','student','parent'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean()
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' })
    return res.json({ success: true, data: { report } })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})


// ── GET /api/reports/preview ────────────────────────────────
// Returns computed exam scores for a student+term without saving.
// Used by the generator form to show a live preview.
router.get('/preview', auth, ALLOWED, async (req, res) => {
  try {
    const { studentId, termStart, termEnd } = req.query
    if (!studentId || !termStart || !termEnd)
      return res.status(400).json({ success: false, message: 'studentId, termStart, termEnd required.' })

    const tStart = new Date(termStart)
    const tEnd   = new Date(termEnd)

    const exams = await Exam.find({
      assignedStudents: studentId,
      startAt: { $gte: tStart, $lte: tEnd },
    }).lean()

    const examIds = exams.map(e => e._id)
    const submissions = await ExamSubmission.find({
      examId: { $in: examIds },
      studentId,
      status: 'graded',
    }).lean()

    const submissionMap = {}
    submissions.forEach(sub => {
      const totalAwarded = (sub.answers||[]).reduce((s,a)=>s+(a.marksAwarded||0),0)
      const exam = exams.find(e=>String(e._id)===String(sub.examId))
      const totalMarks = exam?.totalMarks||100
      submissionMap[String(sub.examId)] = { pct: Math.round((totalAwarded/totalMarks)*100) }
    })

    const subjectMap = {}
    for (const exam of exams) {
      const subj = exam.subject
      if (!subjectMap[subj]) subjectMap[subj] = { weekly:[], endTerm:null }
      const isEndTerm = /end.?term|final|terminal/i.test(exam.title)
      const sub = submissionMap[String(exam._id)]
      if (isEndTerm) subjectMap[subj].endTerm = sub ? sub.pct : null
      else subjectMap[subj].weekly.push(sub ? sub.pct : null)
    }

    const subjects = Object.entries(subjectMap).map(([subject, data]) => {
      const scored = data.weekly.filter(s=>s!==null)
      const weeklyAverage = scored.length ? Math.round(scored.reduce((a,b)=>a+b,0)/scored.length) : null
      const endTermScore  = data.endTerm
      let weightedScore = null
      if (weeklyAverage!==null && endTermScore!==null) weightedScore = Math.round(weeklyAverage*0.30+endTermScore*0.70)
      else if (endTermScore!==null) weightedScore = endTermScore
      else if (weeklyAverage!==null) weightedScore = weeklyAverage
      return {
        subject, weeklyScores: data.weekly, weeklyAverage, endTermScore, weightedScore,
        letterGrade: toLetterGrade(weightedScore),
        missedWeekly: scored.length===0, missedEndTerm: endTermScore===null,
      }
    })

    // Attendance
    const attendance = await Attendance.find({ studentId, date:{ $gte:tStart, $lte:tEnd } }).lean()
    const attended = attendance.filter(a=>a.status==='present').length
    const halfDay  = attendance.filter(a=>a.status==='half_day').length

    return res.json({ success:true, data:{
      subjects,
      attendance: { attended, halfDay, records: attendance.length },
    }})
  } catch(e) {
    console.error('[reports/preview]', e.message)
    return res.status(500).json({ success:false, message: e.message })
  }
})

// ── POST /api/reports/generate ──────────────────────────────
// Pulls live data from Exam, ExamSubmission, Attendance and
// creates (or updates) a Report document.
router.post('/generate', auth, ALLOWED, async (req, res) => {
  try {
    const {
      studentId, academicYear, term,
      termStart, termEnd, termLabel,
      classTeacher, classStream, programme,
      scheduledDays,
      // Subject teacher comments + initials (keyed by subject name)
      subjectComments = {},  // { 'Mathematics': { comment, initials, teacherId } }
      // Learning habits
      learningHabits = {},
      coCurricular = '',
      agreedTargets = [],
      classTeacherReport = '',
      hodRemarks = '',
      issuedBy,
      promotionDecision = '',
      nextTermStart = '',
      reportingTime = '',
    } = req.body

    if (!studentId || !academicYear || !term || !termStart || !termEnd)
      return res.status(400).json({ success: false, message: 'studentId, academicYear, term, termStart, termEnd are required.' })

    const student = await User.findById(studentId).select(
      'firstName lastName admissionNo gender curriculum gradeLevel programme avatar'
    ).lean()
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })

    const tStart = new Date(termStart)
    const tEnd   = new Date(termEnd)

    // ── Attendance ───────────────────────────────────────────
    const attendanceRecords = await Attendance.find({
      studentId,
      date: { $gte: tStart, $lte: tEnd },
    }).lean()

    const attendedDays   = attendanceRecords.filter(a => a.status === 'present').length
    const halfDays       = attendanceRecords.filter(a => a.status === 'half_day').length
    const totalAttended  = attendedDays + Math.round(halfDays / 2)
    const absentDays     = (scheduledDays || 60) - totalAttended
    const attendanceRate = scheduledDays ? Math.round((totalAttended / scheduledDays) * 100) : 0

    // ── Exam scores per subject ──────────────────────────────
    // Find all exams for this student in the term date range
    const exams = await Exam.find({
      assignedStudents: studentId,
      startAt: { $gte: tStart, $lte: tEnd },
    }).lean()

    // Get all submissions for these exams by this student
    const examIds = exams.map(e => e._id)
    const submissions = await ExamSubmission.find({
      examId: { $in: examIds },
      studentId,
      status: 'graded',
    }).lean()

    // Map submission results: examId -> { score, totalMarks, pct }
    const submissionMap = {}
    submissions.forEach(sub => {
      const totalAwarded = (sub.answers || []).reduce((s,a) => s + (a.marksAwarded||0), 0)
      const exam = exams.find(e => String(e._id) === String(sub.examId))
      const totalMarks = exam?.totalMarks || 100
      submissionMap[String(sub.examId)] = {
        pct: Math.round((totalAwarded / totalMarks) * 100),
        marksAwarded: totalAwarded,
        totalMarks,
      }
    })

    // Group exams by subject — label end-term by title containing 'end' or 'term' or 'final'
    const subjectMap = {}
    for (const exam of exams) {
      const subj = exam.subject
      if (!subjectMap[subj]) subjectMap[subj] = { weekly: [], endTerm: null, endTermExam: null }
      const isEndTerm = /end.?term|final|terminal/i.test(exam.title)
      const sub = submissionMap[String(exam._id)]
      if (isEndTerm) {
        subjectMap[subj].endTerm = sub ? sub.pct : null
        subjectMap[subj].endTermExam = exam
      } else {
        subjectMap[subj].weekly.push(sub ? sub.pct : null)
      }
    }

    // Build subject results
    const subjectResults = []
    for (const [subject, data] of Object.entries(subjectMap)) {
      const scoredWeekly = data.weekly.filter(s => s !== null)
      const weeklyAverage = scoredWeekly.length > 0
        ? Math.round(scoredWeekly.reduce((a,b)=>a+b,0) / scoredWeekly.length)
        : null
      const endTermScore = data.endTerm

      // Weighted: weekly 30%, end-term 70%
      let weightedScore = null
      if (weeklyAverage !== null && endTermScore !== null) {
        weightedScore = Math.round(weeklyAverage * 0.30 + endTermScore * 0.70)
      } else if (endTermScore !== null) {
        weightedScore = endTermScore  // no weekly — use end-term only
      } else if (weeklyAverage !== null) {
        weightedScore = weeklyAverage // no end-term — use weekly only
      }

      const meta = subjectComments[subject] || {}

      subjectResults.push({
        subject,
        teacherId:       meta.teacherId || null,
        teacherInitials: meta.initials  || '',
        weeklyScores:    data.weekly,
        weeklyAverage,
        endTermScore,
        weightedScore,
        letterGrade:     toLetterGrade(weightedScore),
        teacherComment:  meta.comment || '',
        missedWeekly:    scoredWeekly.length === 0,
        missedEndTerm:   endTermScore === null,
      })
    }

    // Overall averages
    const withScores = subjectResults.filter(s => s.weightedScore !== null)
    const overallAverage = withScores.length
      ? Math.round(withScores.reduce((s,r)=>s+r.weightedScore,0) / withScores.length)
      : null
    const endTermAverage = subjectResults.filter(s=>s.endTermScore!==null).length
      ? Math.round(subjectResults.filter(s=>s.endTermScore!==null).reduce((s,r)=>s+r.endTermScore,0) / subjectResults.filter(s=>s.endTermScore!==null).length)
      : null

    const DEFAULT_HABITS = {
      effort:3, participation:3, homework:3, organisation:3,
      conduct:3, collaboration:3, feedback:3, digital:3,
    }

    const report = await Report.findOneAndUpdate(
      { studentId, academicYear, term },
      {
        studentId, academicYear, term,
        termLabel:  termLabel || `Term ${term}`,
        termStart:  tStart, termEnd: tEnd,
        studentName:  student.firstName + ' ' + student.lastName,
        admissionNo:  student.admissionNo || '—',
        gender:       student.gender || '—',
        curriculum:   student.curriculum || '—',
        yearGrade:    student.gradeLevel  || '—',
        classStream:  classStream || '—',
        programme:    programme || student.programme || '—',
        classTeacher: classTeacher || '—',
        photoUrl:     student.avatar || '',
        scheduledDays: scheduledDays || 60,
        attendedDays:  totalAttended,
        absentDays:    Math.max(0, absentDays),
        punctualityPct: attendanceRate,
        subjects:       subjectResults,
        endTermAverage, weeklyAverage: null, overallAverage,
        meanGrade:      toLetterGrade(overallAverage),
        learningHabits: { ...DEFAULT_HABITS, ...learningHabits },
        coCurricular, agreedTargets, classTeacherReport, hodRemarks,
        issuedBy: issuedBy || 'Ms. Brendaliz Chelangat — Head of Academics',
        dateIssued: new Date(),
        promotionDecision, nextTermStart, reportingTime,
        generatedBy: req.user._id,
        status: 'draft',
      },
      { upsert: true, new: true }
    )

    return res.json({ success: true, data: { report } })
  } catch(e) {
    console.error('[reports/generate]', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── PATCH /api/reports/:id ──────────────────────────────────
router.patch('/:id', auth, ALLOWED, async (req, res) => {
  try {
    const allowed = [
      'classTeacherReport','hodRemarks','learningHabits','coCurricular',
      'agreedTargets','promotionDecision','nextTermStart','reportingTime',
      'classTeacher','issuedBy','dateIssued','status',
      'subjects','scheduledDays',
    ]
    const upd = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) upd[k] = req.body[k] })
    const report = await Report.findByIdAndUpdate(req.params.id, { $set: upd }, { new: true })
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' })
    return res.json({ success: true, data: { report } })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/reports/:id/pdf-html ──────────────────────────
// Returns the HTML that the frontend opens in a new window for print-to-PDF
router.get('/:id/pdf-html', auth, requireRole('admin','ops_manager','accountant','teacher','parent'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean()
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' })
    return res.json({ success: true, data: { html: buildReportHTML(report) } })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/reports/:id/pdf ────────────────────────
// Premium branded PDF. Staff, teachers, the student, and linked
// parents (published reports only for families).
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const { buildTermReportPdf } = require('../lib/reportPdf')
    const report = await Report.findById(req.params.id).lean()
    if (!report) return res.status(404).json({ success:false, message:'Report not found.' })

    const role = req.user.role
    const staff = ['admin','ops_manager','dos','accountant','teacher'].includes(role)
    const isStudent = role === 'student' && String(report.studentId) === String(req.user._id)
    const isParent = role === 'parent' && [ ...(req.user.linkedStudents||[]), ...(req.user.children||[]) ]
      .map(String).includes(String(report.studentId))
    if (!staff && !isStudent && !isParent)
      return res.status(403).json({ success:false, message:'Access denied.' })
    if ((isStudent || isParent) && report.status !== 'published')
      return res.status(403).json({ success:false, message:'This report has not been published yet.' })

    const pdf = await buildTermReportPdf(report)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="Report-' + (report.admissionNo||report.studentName||'student').replace(/[^A-Za-z0-9-]/g,'-') + '-T' + report.term + '.pdf"')
    return res.send(pdf)
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── DELETE /api/reports/:id ─────────────────────────────────
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id)
    return res.json({ success: true, message: 'Report deleted.' })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ══════════════════════════════════════════════════════════════
// HTML REPORT BUILDER — matches the attached PDF exactly
// ══════════════════════════════════════════════════════════════
function buildReportHTML(r) {
  const esc  = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const pct  = n => n === null || n === undefined ? '—' : Math.round(n) + '%'
  const num  = n => n === null || n === undefined ? '—' : Math.round(n)
  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) } catch { return '' } }

  const HABIT_LABELS = {
    effort:        'Effort & diligence',
    participation: 'Class participation',
    homework:      'Homework completion & punctuality',
    organisation:  'Organisation & independent study',
    conduct:       'Conduct & courtesy',
    collaboration: 'Collaboration with peers',
    feedback:      'Responsiveness to feedback',
    digital:       'Digital learning discipline (LMS & online lessons)',
  }
  const HABIT_COLS = [1,2,3,4]
  const HABIT_NAMES = ['CONCERN','DEVELOPING','GOOD','EXCELLENT']

  const habitRows = Object.entries(HABIT_LABELS).map(([key, label]) => {
    const val = r.learningHabits?.[key] || 3
    const cells = HABIT_COLS.map(c => `<td class="hc">${c === val ? '✓' : ''}</td>`).join('')
    return `<tr><td class="ha">${esc(label)}</td>${cells}</tr>`
  }).join('')

  const subjectRows = (r.subjects || []).map(s => {
    const weekly = s.missedWeekly ? '<span style="color:#9A2434;font-style:italic">Missed</span>' : (s.weeklyAverage !== null ? s.weeklyAverage + '%' : '—')
    const endT   = s.missedEndTerm ? '—' : (s.endTermScore !== null ? s.endTermScore : '—')
    return `<tr>
      <td class="sb">${esc(s.subject)}</td>
      <td class="sc">${weekly}</td>
      <td class="sc">${endT !== '—' ? endT : '—'}</td>
      <td class="sl">${esc(s.teacherComment)}</td>
      <td class="si">${esc(s.teacherInitials)}</td>
    </tr>`
  }).join('')

  const emptyRows = Math.max(0, 8 - (r.subjects||[]).length)
  const blankRows = Array(emptyRows).fill('<tr><td class="sb"></td><td class="sc"></td><td class="sc"></td><td class="sl"></td><td class="si"></td></tr>').join('')

  const targets = (r.agreedTargets||[]).map((t,i) => `<div style="font-size:12px;margin-bottom:3px">${i+1}. ${esc(t)}</div>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Academic Report — ${esc(r.studentName)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1A1A1A;background:#ddd}
.page{width:210mm;min-height:297mm;background:#fff;margin:40px auto 20px;padding:0;page-break-after:always;box-shadow:0 4px 24px rgba(0,0,0,.15)}
.border-frame{margin:6mm;border:2.5px solid #8B1A2E;padding:0 5mm 5mm}
/* Header */
.hdr{display:flex;justify-content:space-between;align-items:center;padding:5mm 0 3mm;border-bottom:3px solid #8B1A2E}
.logo-area{display:flex;align-items:center;gap:10px}
.brand{font-size:24px;font-weight:900;letter-spacing:-0.5px}
.brand em{font-style:italic;color:#8B1A2E}
.brand-sub{font-size:7px;letter-spacing:3px;font-weight:600;color:#888;margin-top:2px}
.doc-title{text-align:center;flex:1}
.doc-title h1{font-size:15px;font-weight:900;text-transform:uppercase;letter-spacing:.5px}
.doc-title .sub{font-size:11px;font-style:italic;color:#8B1A2E;margin-top:2px}
/* Student info */
.student-info{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:0;margin:4mm 0;border:1px solid #ddd}
.info-cell{padding:4px 7px;border-right:1px solid #ddd;border-bottom:1px solid #ddd}
.info-cell:last-child{border-right:none}
.info-label{font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8B1A2E;margin-bottom:2px}
.info-value{font-size:12px;font-weight:800;color:#1A1A1A}
.photo-cell{width:80px;padding:4px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #ddd;grid-row:span 2}
.photo-cell img{width:72px;height:88px;object-fit:cover;border:1px solid #ddd}
.photo-placeholder{width:72px;height:88px;background:#F5F5F5;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:9px;color:#999;text-align:center}
/* Attendance */
.att-row{display:flex;align-items:stretch;border:1px solid #ddd;margin-bottom:4mm}
.att-label{background:#8B1A2E;color:#fff;font-weight:800;font-size:10px;padding:6px 10px;display:flex;align-items:center;letter-spacing:.5px;min-width:90px}
.att-cell{padding:4px 14px;border-right:1px solid #ddd;display:flex;flex-direction:column;justify-content:center}
.att-cell:last-child{border-right:none}
.att-k{font-size:8px;color:#888;text-transform:uppercase;letter-spacing:.5px}
.att-v{font-size:12px;font-weight:700}
/* Section headers */
.sec-hdr{background:#8B1A2E;color:#C9A030;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:4px 8px;margin-bottom:0}
/* Exam table */
.etbl{width:100%;border-collapse:collapse;font-size:10.5px}
.etbl thead tr{background:#1A1A1A}
.etbl thead th{color:#fff;font-size:8.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:5px 6px;border:1px solid #444}
.etbl thead th.wide{text-align:left;width:38%}
.etbl thead th.nw{width:80px}
.sb{padding:6px;font-weight:700;border:1px solid #ddd;vertical-align:top}
.sc{padding:6px;text-align:center;border:1px solid #ddd;vertical-align:top}
.sl{padding:6px;border:1px solid #ddd;font-size:10px;line-height:1.45;color:#333}
.si{padding:6px;text-align:center;border:1px solid #ddd;font-weight:700;font-size:9px}
/* Summary row */
.sum-row{display:flex;margin-top:0;border:1px solid #ddd;border-top:2px solid #8B1A2E}
.sum-cell{flex:1;padding:5px 8px;border-right:1px solid #ddd}
.sum-cell:last-child{border-right:none}
.sum-k{font-size:8px;font-weight:700;text-transform:uppercase;color:#8B1A2E;letter-spacing:.5px}
.sum-v{font-size:12px;font-weight:800;margin-top:1px}
/* Grading key */
.gkey{display:grid;grid-template-columns:1fr 1fr;gap:1px 20px;font-size:9.5px;margin:3mm 0}
.gkey-row{display:flex;gap:6px;margin-bottom:2px}
.gkey-grade{font-weight:800;min-width:20px;color:#8B1A2E}
.gkey-range{min-width:40px;color:#555}
/* Learning habits table */
.htbl{width:100%;border-collapse:collapse;font-size:10px;margin-top:2mm}
.htbl th{background:#1A1A1A;color:#fff;font-size:8px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:4px 6px;border:1px solid #444;text-align:center}
.htbl th.wide{text-align:left;width:55%}
.ha{padding:5px 6px;border:1px solid #ddd;font-weight:500}
.hc{padding:5px;border:1px solid #ddd;text-align:center;font-weight:800;color:#8B1A2E}
/* Remarks */
.remarks-box{margin-top:3mm;padding:5px 8px;font-size:10.5px;line-height:1.6;min-height:28mm;border:1px solid #ddd}
.sign-row{display:flex;justify-content:space-between;font-size:10px;margin-top:2mm;padding-top:2mm;border-top:1px solid #ddd}
/* Promotion */
.promo-row{display:flex;gap:20px;font-size:10.5px;align-items:center;margin:2mm 0;padding:4px 8px;background:#F9F6F4;border:1px solid #ddd}
/* Footer */
.ft{font-size:8px;color:#777;text-align:center;margin-top:4mm;padding-top:3mm;border-top:1px solid #ddd;line-height:1.6}
.ft em{font-style:italic}
/* Print */
.toolbar{position:fixed;top:0;left:0;right:0;background:#8B1A2E;color:#fff;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:99}
.toolbar button{background:#C9A030;color:#7D1025;border:none;padding:9px 22px;border-radius:6px;font-weight:800;font-size:13px;cursor:pointer}
@media print{body{background:#fff}.toolbar{display:none}.page{margin:0;box-shadow:none;width:100%}@page{size:A4 portrait;margin:0}}
</style></head><body>
<div class="toolbar">
  <span style="font-size:12px;opacity:.8">Academic Report — ${esc(r.studentName)} — ${esc(r.termLabel || 'Term '+r.term)} ${esc(r.academicYear)}</span>
  <button onclick="window.print()">⬇ Download PDF</button>
</div>

<!-- PAGE 1 -->
<div class="page">
<div class="border-frame">

<!-- Header -->
<div class="hdr">
  <div class="logo-area">
    <svg width="52" height="58" viewBox="0 0 80 80">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A8203A"/><stop offset="100%" stop-color="#7A1026"/></linearGradient></defs>
      <path d="M40 4 L70 12 Q72 12 72 15 L72 44 Q72 62 40 75 Q8 62 8 44 L8 15 Q8 12 10 12 Z" fill="url(#sg)" stroke="#C9A030" stroke-width="1"/>
      <polygon points="40,18 42.5,25.5 50.5,25.5 44.2,30.2 46.7,37.5 40,32.8 33.3,37.5 35.8,30.2 29.5,25.5 37.5,25.5" fill="#C9A030"/>
      <g transform="translate(40 56)">
        <path d="M0 -9 C-5 -12 -14 -12 -16 -9 L-16 10 C-13 8 -5 8 0 12 Z" fill="#fff"/>
        <path d="M0 -9 C5 -12 14 -12 16 -9 L16 10 C13 8 5 8 0 12 Z" fill="#fff"/>
      </g>
    </svg>
    <div>
      <div style="font-size:26px;font-weight:900;letter-spacing:-.5px">Smart<em style="font-style:italic;color:#8B1A2E">ious</em></div>
      <div style="font-size:7px;letter-spacing:3px;font-weight:600;color:#888;text-transform:uppercase">HOMESCHOOL &nbsp;·&nbsp; GLOBAL</div>
      <div style="font-size:7px;color:#aaa;margin-top:1px">EST. 2018</div>
    </div>
  </div>
  <div class="doc-title">
    <h1>End of ${esc(r.termLabel||'Term '+r.term)} Academic Report</h1>
    <div class="sub">Academic Year ${esc(r.academicYear)}${r.term===3?' · Final Term':r.term===2?' · Mid Year':' · First Term'}</div>
  </div>
  <div style="width:52px"></div>
</div>

<!-- Student Info Grid -->
<div class="student-info" style="margin-top:4mm">
  <div class="info-cell"><div class="info-label">Student Full Name</div><div class="info-value" style="font-size:14px">${esc(r.studentName)}</div></div>
  <div class="info-cell"><div class="info-label">Admission No.</div><div class="info-value">${esc(r.admissionNo)}</div></div>
  <div class="info-cell"><div class="info-label">Gender</div><div class="info-value">${esc(r.gender)}</div></div>
  ${r.photoUrl
    ? `<div class="photo-cell"><img src="${esc(r.photoUrl)}" alt="Student photo"/></div>`
    : `<div class="photo-cell"><div class="photo-placeholder">No<br>Photo</div></div>`}
  <div class="info-cell"><div class="info-label">Curriculum</div><div class="info-value">${esc(r.curriculum)}</div></div>
  <div class="info-cell"><div class="info-label">Year / Grade</div><div class="info-value">${esc(r.yearGrade)}</div></div>
  <div class="info-cell"><div class="info-label">Class / Stream</div><div class="info-value">${esc(r.classStream||'—')}</div></div>
  <div class="info-cell"><div class="info-label">Programme</div><div class="info-value">${esc(r.programme)}</div></div>
  <div class="info-cell"><div class="info-label">Class Teacher</div><div class="info-value">${esc(r.classTeacher)}</div></div>
  <div class="info-cell"><div class="info-label">Date Issued</div><div class="info-value">${fmtDate(r.dateIssued)}</div></div>
</div>

<!-- Attendance -->
<div class="att-row">
  <div class="att-label">ATTENDANCE</div>
  <div class="att-cell"><div class="att-k">Days scheduled (Mon–Fri)</div><div class="att-v">${r.scheduledDays||60}</div></div>
  <div class="att-cell"><div class="att-k">Attended</div><div class="att-v">${r.attendedDays}</div></div>
  <div class="att-cell"><div class="att-k">Absent</div><div class="att-v">${r.absentDays}</div></div>
  <div class="att-cell"><div class="att-k">Punctuality</div><div class="att-v">${r.punctualityPct}%</div></div>
  <div class="att-cell"><div class="att-k">Attendance rate</div><div class="att-v">${r.punctualityPct}%</div></div>
</div>

<!-- Academic Performance -->
<div class="sec-hdr">Academic Performance — ${esc(r.termLabel||'Term '+r.term)} Examination Results</div>
<table class="etbl">
  <thead><tr>
    <th class="wide" style="text-align:left">Subject</th>
    <th class="nw">Weekly Assessment Average (%) <span style="font-size:7px;font-weight:400;display:block">30% weight</span></th>
    <th class="nw">End-of-Term Exam (%) <span style="font-size:7px;font-weight:400;display:block">70% weight</span></th>
    <th style="text-align:left">Subject Teacher's Comment</th>
    <th style="width:36px">Init.</th>
  </tr></thead>
  <tbody>
    ${subjectRows}
    ${blankRows}
  </tbody>
</table>

<!-- Summary row -->
<div class="sum-row">
  <div class="sum-cell">
    <div class="sum-k">Weekly Assessments Average</div>
    <div class="sum-v">${r.subjects?.some(s=>s.missedWeekly) ? '— (missed)' : (r.weeklyAverage ? r.weeklyAverage+'%' : '—')}</div>
  </div>
  <div class="sum-cell">
    <div class="sum-k">End-of-Term Average</div>
    <div class="sum-v">${r.endTermAverage !== null ? r.endTermAverage+'%' : '—'}</div>
  </div>
  <div class="sum-cell">
    <div class="sum-k">Mean Grade</div>
    <div class="sum-v">${esc(r.meanGrade)}</div>
  </div>
  <div class="sum-cell">
    <div class="sum-k">Weighted Average (30/70)</div>
    <div class="sum-v">${r.overallAverage !== null ? r.overallAverage+'%' : '—'}</div>
  </div>
</div>

<!-- Grading Key -->
<div style="margin-top:3mm"><div style="font-size:8.5px;font-weight:800;color:#8B1A2E;text-transform:uppercase;letter-spacing:1px;margin-bottom:2mm">Grading Key</div>
<div class="gkey">
  <div><div class="gkey-row"><span class="gkey-grade">A* / A</span><span class="gkey-range">80–100</span><span>Excellent — exceeds level expectations</span></div>
  <div class="gkey-row"><span class="gkey-grade">B</span><span class="gkey-range">70–79</span><span>Very good — secure command</span></div>
  <div class="gkey-row"><span class="gkey-grade">C</span><span class="gkey-range">60–69</span><span>Good — meets expectations</span></div></div>
  <div><div class="gkey-row"><span class="gkey-grade">D</span><span class="gkey-range">50–59</span><span>Satisfactory — developing</span></div>
  <div class="gkey-row"><span class="gkey-grade">E</span><span class="gkey-range">40–49</span><span>Needs support — targeted intervention</span></div>
  <div class="gkey-row"><span class="gkey-grade">U</span><span class="gkey-range">0–39</span><span>Ungraded — foundation rebuild required</span></div></div>
</div>
<div style="font-size:8px;color:#777;font-style:italic;margin-top:2mm">Grade boundaries follow the conventions of the student's curriculum (Cambridge/Edexcel letter grades, IB 1–7, CBC performance levels, American GPA); the scale above is the Smartious common reference. Weekly assessment marks are drawn from the LMS gradebook across the term.</div>
</div>

<div class="ft">Smartious Homeschool &amp; eSchool · Diamond Plaza, 4th Avenue Parklands · Karen Centre · Nairobi · smartioushomeschool.com · +254 745 021 212 &nbsp;&nbsp;<strong>1</strong></div>
</div></div><!-- end page 1 -->

<!-- PAGE 2 -->
<div class="page">
<div class="border-frame">

<!-- Learning Habits -->
<div class="sec-hdr" style="margin-top:3mm">Learning Habits &amp; Personal Development</div>
<table class="htbl">
  <thead><tr>
    <th class="wide">Area</th>
    <th>Excellent</th><th>Good</th><th>Developing</th><th>Concern</th>
  </tr></thead>
  <tbody>${habitRows}</tbody>
</table>

<!-- Co-Curricular -->
<div style="margin-top:4mm">
  <div class="sec-hdr">Co-Curricular Participation &amp; Achievements This Year</div>
  <div style="padding:6px 8px;font-size:10.5px;min-height:16mm;border:1px solid #ddd;border-top:none;line-height:1.6">${esc(r.coCurricular||'—')}</div>
</div>

<!-- Agreed Targets -->
<div style="margin-top:4mm">
  <div class="sec-hdr">Agreed Targets for the New Academic Year (Set with the Student)</div>
  <div style="padding:6px 8px;font-size:10.5px;min-height:14mm;border:1px solid #ddd;border-top:none;line-height:1.7">
    ${targets || '<span style="color:#999">—</span>'}
  </div>
</div>

<!-- Class Teacher Report -->
<div style="margin-top:4mm">
  <div class="sec-hdr">Class Teacher's Report</div>
  <div class="remarks-box" style="border-top:none">${esc(r.classTeacherReport||'')}</div>
  <div class="sign-row" style="padding:3px 8px">
    <span>Class teacher name: <strong>${esc(r.classTeacher||'')}</strong></span>
    <span>Signature: ____________________</span>
    <span>Date: ${fmtDate(r.dateIssued)}</span>
  </div>
</div>

<!-- HoD Remarks -->
<div style="margin-top:4mm">
  <div class="sec-hdr">Head of Academics' Remarks</div>
  <div class="remarks-box" style="border-top:none">${esc(r.hodRemarks||'')}</div>
  <div class="sign-row" style="padding:3px 8px">
    <span>Name: <strong>${esc(r.issuedBy||'')}</strong></span>
    <span>Signature: ____________________</span>
    <span>Official stamp:</span>
  </div>
</div>

<!-- Promotion -->
<div style="margin-top:4mm">
  <div class="promo-row">
    <strong style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#8B1A2E">End-of-Year Decision</strong>
    <span>☐ Promoted to: ____________________</span>
    <span>☐ Promoted on probation</span>
    <span>☐ To repeat: ____________________</span>
    <span>☐ Completing — external examinations</span>
  </div>
  <div style="display:flex;gap:20px;font-size:10px;padding:3px 8px">
    <span>Next Academic Year &nbsp; Term 1 begins: <strong>${esc(r.nextTermStart||'____________________')}</strong></span>
    <span>Reporting time: <strong>${esc(r.reportingTime||'____________')}</strong></span>
    <span>Fees per published Fee Structure — statement attached</span>
  </div>
</div>

<!-- Parent Acknowledgement -->
<div style="margin-top:4mm;border:1px solid #ddd;padding:6px 8px">
  <div style="font-size:9.5px;font-weight:700;color:#8B1A2E;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Parent / Guardian Acknowledgement — I have received and discussed this report with my child.</div>
  <div style="display:flex;gap:30px;font-size:10px;margin-bottom:6px">
    <span>Name: ______________________________</span>
    <span>Signature: ______________________</span>
    <span>Date: ______________</span>
  </div>
  <div style="font-size:10px">Parent's comment (optional): ______________________________________________</div>
</div>

<!-- Motto -->
<div style="text-align:center;font-style:italic;font-size:11px;color:#8B1A2E;margin:4mm 0 2mm;font-weight:600">"Premium education with a heart — every child, known."</div>

<div style="font-size:8.5px;color:#777;line-height:1.7;font-style:italic;border-top:1px solid #ddd;padding-top:2mm">
  This report is an official document of Smartious Homeschool &amp; eSchool and is invalid without the official stamp. Queries: hello@smartioushomeschool.com · +254 745 021 212 · Verification letters available per the published Fee Structure. Full mark breakdowns, examination scripts and learning plans are available in the Parent Portal.
</div>

<div class="ft">Smartious Homeschool &amp; eSchool · Diamond Plaza, 4th Avenue Parklands · Karen Centre · Nairobi · smartioushomeschool.com · +254 745 021 212 &nbsp;&nbsp;<strong>2</strong></div>
</div></div><!-- end page 2 -->

</body></html>`
}



// ── POST /api/reports/:id/publish ────────────────────────


// ── POST /api/reports/teacher-save ───────────────────────


// ── GET /api/reports/my-saved ─────────────────────────────


// ── Parent notification ───────────────────────────────────
async function notifyParentReportReady(report, student) {
  const nodemailer = require('nodemailer')
  const u = process.env.EMAIL_USER, p = process.env.EMAIL_PASSWORD
  if (!u||!p) return 0
  const t = nodemailer.createTransport({ host:process.env.EMAIL_HOST||'smtp.gmail.com', port:parseInt(process.env.EMAIL_PORT||'587',10), secure:false, auth:{ user:u, pass:p } })
  // Resolve the student. report.studentId may already be a populated user
  // document (the /:id/publish route populates it), in which case we use it
  // directly rather than re-querying with an object.
  let s = student
  if (!s && report.studentId) {
    s = (typeof report.studentId === 'object' && report.studentId.parentEmail !== undefined)
      ? report.studentId
      : await User.findById(report.studentId).select('parentEmail linkedParents').lean()
  }
  if (!s) return 0

  // Only ever send to a real address. A linked parent record with a missing
  // or blank email previously added `undefined` here, which nodemailer
  // accepted and turned into a blank email alongside the real one.
  const addEmail = (set, raw) => {
    const e = String(raw || '').trim().toLowerCase()
    if (e && e.includes('@')) set.add(e)
  }
  const emails = new Set()
  addEmail(emails, s.parentEmail)
  if (s.linkedParents?.length) {
    const pp = await User.find({ _id:{ $in:s.linkedParents } }).select('email').lean()
    pp.forEach(p => {
      if (!p.email) console.warn('[report notify] linked parent', String(p._id), 'has no email — skipped')
      addEmail(emails, p.email)
    })
  }
  if (!emails.size) return 0
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;"><tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px;"><div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool · Academic Report</div><div style="font-size:20px;font-weight:800;color:#fff;">New report available</div><div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;">${report.studentName}</div></td></tr><tr><td style="padding:28px 32px;"><p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.65;">A new academic report for <strong>${report.studentName}</strong> has been published — <strong>${report.subject||'General'} · Term ${report.term} · ${report.academicYear}</strong>.</p>${report.overallAverage!==null&&report.overallAverage!==undefined?`<p style="font-size:18px;font-weight:800;color:#7D1025;margin:0 0 20px;">Overall: ${report.overallAverage}% (${report.meanGrade||''})</p>`:''}<a href="https://smartioushomeschool.com/parent" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">View & download in parent portal</a></td></tr><tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;"><p style="font-size:11px;color:#999;margin:0;">© Smartious Homeschool Global</p></td></tr></table></td></tr></table></body></html>`
  let sent = 0
  for (const email of emails) { try { await t.sendMail({ from:process.env.EMAIL_FROM||'Smartious <hello@smartioushomeschool.com>', to:email, subject:`New report — ${report.studentName} · ${report.subject||'General'}`, html }); sent++ } catch(e) { console.error('[report notify]',email,e.message) } }
  return sent
}
module.exports.notifyParentReportReady = notifyParentReportReady

module.exports = router
