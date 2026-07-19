/**
 * routes/dos-analytics.js
 * Dean of Studies analytics API.
 * Aggregates exam scores, homework compliance, lesson coverage
 * and attendance trends for the DOS portal dashboard.
 * Mounted at /api/dos
 */
const express  = require('express')
const router   = express.Router()
const mongoose = require('mongoose')
const { auth, requireRole } = require('../middleware/auth')

const ALLOWED = requireRole('admin', 'dos')

// ── Lazy model loaders ──────────────────────────────────────
const m = name => mongoose.model(name)

// ═══════════════════════════════════════════════════════════
// GET /api/dos/overview
// High-level KPIs: students, teachers, active exams, avg score,
// homework compliance rate, attendance rate this week.
// ═══════════════════════════════════════════════════════════
router.get('/overview', auth, ALLOWED, async (req, res) => {
  try {
    const User     = m('User')
    const Exam     = m('Exam')
    const ExamSubmission = m('ExamSubmission')
    const Homework = m('Homework')
    const HomeworkSubmission = m('HomeworkSubmission')
    const Attendance = m('Attendance')

    const now   = new Date()
    const wkAgo = new Date(now - 7*24*60*60*1000)
    const moAgo = new Date(now - 30*24*60*60*1000)

    const [
      totalStudents, totalTeachers,
      examsThisMonth, gradedSubs,
      hwThisMonth, hwGraded,
      attThisWeek,
    ] = await Promise.all([
      User.countDocuments({ role:'student', isActive:true }),
      User.countDocuments({ role:'teacher', isActive:true }),
      Exam.countDocuments({ startAt:{ $gte:moAgo } }),
      ExamSubmission.find({ status:'graded', updatedAt:{ $gte:moAgo } })
        .select('examId studentId answers').lean(),
      Homework.countDocuments({ createdAt:{ $gte:moAgo } }),
      HomeworkSubmission.countDocuments({ status:{ $in:['graded','released'] }, updatedAt:{ $gte:moAgo } }),
      Attendance.find({ date:{ $gte:wkAgo } }).lean(),
    ])

    // Average exam score this month
    let totalPct = 0, countPct = 0
    const examMarksCache = {}
    for (const sub of gradedSubs) {
      const awarded = (sub.answers||[]).reduce((s,a)=>s+(a.marksAwarded||0),0)
      // Get exam total marks
      if (!examMarksCache[String(sub.examId)]) {
        const ex = await m('Exam').findById(sub.examId).select('totalMarks').lean()
        examMarksCache[String(sub.examId)] = ex?.totalMarks || 100
      }
      const total = examMarksCache[String(sub.examId)]
      if (total > 0) { totalPct += (awarded/total)*100; countPct++ }
    }
    const avgExamScore = countPct ? Math.round(totalPct/countPct) : null

    // Homework compliance rate (graded/assigned this month)
    const hwComplianceRate = hwThisMonth > 0
      ? Math.round((hwGraded / (hwThisMonth * Math.max(1, totalStudents))) * 100)
      : null

    // Attendance rate this week
    const present = attThisWeek.filter(a=>a.status==='present').length
    const total   = attThisWeek.length
    const attendanceRate = total > 0 ? Math.round((present/total)*100) : null

    return res.json({ success:true, data:{
      totalStudents, totalTeachers,
      examsThisMonth, avgExamScore,
      hwThisMonth, hwGraded, hwComplianceRate,
      attendanceRate, attendanceRecordsThisWeek: total,
    }})
  } catch(e) {
    console.error('[dos/overview]', e.message)
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ═══════════════════════════════════════════════════════════
// GET /api/dos/exam-analytics
// Per-subject, per-curriculum exam performance breakdown.
// ?termStart=&termEnd=&curriculum=&subject=&grade=
// ═══════════════════════════════════════════════════════════
router.get('/exam-analytics', auth, ALLOWED, async (req, res) => {
  try {
    const { termStart, termEnd, curriculum, subject, grade } = req.query
    const Exam = m('Exam'), ExamSubmission = m('ExamSubmission')

    const examFilter = {}
    if (termStart) examFilter.startAt = { ...examFilter.startAt, $gte: new Date(termStart) }
    if (termEnd)   examFilter.startAt = { ...examFilter.startAt, $lte: new Date(termEnd) }
    if (curriculum) examFilter.curriculum = curriculum
    if (subject)    examFilter.subject    = subject
    if (grade)      examFilter.grade      = grade

    const exams = await Exam.find(examFilter)
      .sort({ startAt:-1 }).lean()

    const examIds = exams.map(e=>e._id)
    const subs = await ExamSubmission.find({ examId:{ $in:examIds }, status:'graded' })
      .lean()

    // Group by subject
    const bySubject = {}
    for (const exam of exams) {
      const subj = exam.subject
      if (!bySubject[subj]) bySubject[subj] = {
        subject:subj, curriculum:exam.curriculum, grade:exam.grade,
        exams:[], totalStudents:0, avgScore:null, highest:null, lowest:null,
        passRate:null, gradeDistribution:{ A:0,B:0,C:0,D:0,E:0,U:0 },
      }
      const examSubs = subs.filter(s=>String(s.examId)===String(exam._id))
      const scores   = examSubs.map(s=>{
        const awarded = (s.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
        return exam.totalMarks > 0 ? Math.round((awarded/exam.totalMarks)*100) : 0
      })
      bySubject[subj].exams.push({
        title:exam.title, date:exam.startAt, type:/end.?term|final/i.test(exam.title)?'endterm':'weekly',
        students:scores.length, avg:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null,
        highest:scores.length?Math.max(...scores):null, lowest:scores.length?Math.min(...scores):null,
        scores,
      })
      scores.forEach(sc => {
        const g = sc>=80?'A':sc>=70?'B':sc>=60?'C':sc>=50?'D':sc>=40?'E':'U'
        bySubject[subj].gradeDistribution[g]++
      })
    }

    // Compute overall stats per subject
    const results = Object.values(bySubject).map(s => {
      const all = s.exams.flatMap(e=>e.scores)
      s.avgScore  = all.length ? Math.round(all.reduce((a,b)=>a+b,0)/all.length) : null
      s.highest   = all.length ? Math.max(...all) : null
      s.lowest    = all.length ? Math.min(...all) : null
      s.passRate  = all.length ? Math.round((all.filter(x=>x>=50).length/all.length)*100) : null
      s.totalStudents = Math.max(...s.exams.map(e=>e.students), 0)
      return s
    })

    return res.json({ success:true, data:{ subjects:results, totalExams:exams.length, totalSubmissions:subs.length } })
  } catch(e) {
    console.error('[dos/exam-analytics]', e.message)
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ═══════════════════════════════════════════════════════════
// GET /api/dos/homework-compliance
// For each teacher: lessons taught vs homework set vs marked.
// Ensures every lesson has homework assigned AND marked.
// ═══════════════════════════════════════════════════════════
router.get('/homework-compliance', auth, ALLOWED, async (req, res) => {
  try {
    const { teacherId, subject, curriculum, termStart, termEnd } = req.query
    const User     = m('User')
    const Lesson   = m('Lesson')
    const Homework = m('Homework')
    const HomeworkSubmission = m('HomeworkSubmission')

    const dateFilter = {}
    if (termStart) dateFilter.$gte = new Date(termStart)
    if (termEnd)   dateFilter.$lte = new Date(termEnd)

    // Get all teachers (or one specific)
    const teacherFilter = { role:'teacher', isActive:true }
    if (teacherId) teacherFilter._id = new mongoose.Types.ObjectId(teacherId)
    const teachers = await User.find(teacherFilter).select('firstName lastName').lean()

    const results = []

    for (const teacher of teachers) {
      // Lessons this teacher published (in term range if set)
      const lessonFilter = { teacherId: teacher._id, status:'published' }
      if (Object.keys(dateFilter).length) lessonFilter.createdAt = dateFilter
      if (subject)    lessonFilter.subject    = subject
      if (curriculum) lessonFilter.curriculum = curriculum

      const lessons = await Lesson.find(lessonFilter)
        .select('title subject curriculum lessonNumber').lean()

      // Homework this teacher set
      const hwFilter = { teacherId: teacher._id }
      if (Object.keys(dateFilter).length) hwFilter.createdAt = dateFilter
      if (subject)    hwFilter.subject    = subject
      if (curriculum) hwFilter.curriculum = curriculum

      const homeworks = await Homework.find(hwFilter)
        .select('title subject lessonId status').lean()

      // Graded submissions
      const hwIds = homeworks.map(h=>h._id)
      const gradedSubs = await HomeworkSubmission.countDocuments({
        homework: { $in: hwIds },
        status:   { $in: ['graded','released'] },
      })
      const totalSubs = await HomeworkSubmission.countDocuments({
        homework: { $in: hwIds },
        status:   { $in: ['submitted','graded','released'] },
      })

      // Lessons with homework linked
      const lessonIds = lessons.map(l=>String(l._id))
      const hwLessonIds = [...new Set(homeworks.map(h=>String(h.lessonId)).filter(Boolean))]
      const lessonsWithHW = lessonIds.filter(id=>hwLessonIds.includes(id)).length

      // Find lessons WITHOUT homework
      const lessonsWithoutHW = lessons.filter(l=>!hwLessonIds.includes(String(l._id)))

      results.push({
        teacherId:  teacher._id,
        teacherName: teacher.firstName + ' ' + teacher.lastName,
        totalLessons: lessons.length,
        homeworkSet:  homeworks.length,
        lessonsWithHW,
        lessonsWithoutHW: lessonsWithoutHW.length,
        missingHWLessons: lessonsWithoutHW.map(l=>({ id:l._id, title:l.title, subject:l.subject })),
        totalSubmissions: totalSubs,
        gradedSubmissions: gradedSubs,
        markingRate: totalSubs > 0 ? Math.round((gradedSubs/totalSubs)*100) : null,
        complianceScore: lessons.length > 0
          ? Math.round(((lessonsWithHW/lessons.length)*0.5 + (totalSubs>0?gradedSubs/totalSubs:0)*0.5)*100)
          : null,
      })
    }

    results.sort((a,b) => (a.complianceScore||0) - (b.complianceScore||0))

    return res.json({ success:true, data:{ teachers:results } })
  } catch(e) {
    console.error('[dos/homework-compliance]', e.message)
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ═══════════════════════════════════════════════════════════
// GET /api/dos/student-trends
// Per-student performance trend across exams over time.
// ?studentId=&subject=&termStart=&termEnd=
// ═══════════════════════════════════════════════════════════
router.get('/student-trends', auth, ALLOWED, async (req, res) => {
  try {
    const { studentId, subject, curriculum, grade, termStart, termEnd } = req.query
    const User = m('User'), Exam = m('Exam'), ExamSubmission = m('ExamSubmission')
    const Attendance = m('Attendance'), Homework = m('Homework')
    const HomeworkSubmission = m('HomeworkSubmission')

    // Get students
    const studentFilter = { role:'student', isActive:true }
    if (studentId) studentFilter._id = new mongoose.Types.ObjectId(studentId)
    if (curriculum) studentFilter.curriculum = curriculum
    if (grade) studentFilter.gradeLevel = grade
    const students = await User.find(studentFilter)
      .select('firstName lastName curriculum gradeLevel admissionNo').lean()

    const examFilter = { status:{ $in:['ended','archived'] } }
    if (termStart) examFilter.startAt = { ...examFilter.startAt, $gte: new Date(termStart) }
    if (termEnd)   examFilter.startAt = { ...examFilter.startAt, $lte: new Date(termEnd) }
    if (subject)   examFilter.subject = subject

    const exams = await Exam.find(examFilter).sort({ startAt:1 }).lean()
    const examIds = exams.map(e=>e._id)

    const allSubs = await ExamSubmission.find({
      examId: { $in: examIds },
      studentId: studentId ? new mongoose.Types.ObjectId(studentId) : { $exists:true },
      status: 'graded',
    }).lean()

    const results = []
    for (const student of students) {
      const studentSubs = allSubs.filter(s=>String(s.studentId)===String(student._id))

      const trend = exams.map(exam => {
        const sub = studentSubs.find(s=>String(s.examId)===String(exam._id))
        if (!sub) return { date:exam.startAt, subject:exam.subject, title:exam.title, score:null, absent:true }
        const awarded = (sub.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
        const pct = exam.totalMarks>0 ? Math.round((awarded/exam.totalMarks)*100) : 0
        return { date:exam.startAt, subject:exam.subject, title:exam.title, score:pct, absent:false }
      }).filter(t=>!t.absent || t.absent)

      const scores = trend.filter(t=>!t.absent && t.score!==null).map(t=>t.score)
      const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null

      // Attendance rate in period
      const attFilter = { studentId:student._id }
      if (termStart) attFilter.date = { ...attFilter.date, $gte: new Date(termStart) }
      if (termEnd)   attFilter.date = { ...attFilter.date, $lte: new Date(termEnd) }
      const attRecords = await Attendance.find(attFilter).select('status').lean()
      const attRate = attRecords.length
        ? Math.round((attRecords.filter(a=>a.status==='present').length/attRecords.length)*100)
        : null

      // HW submission rate
      const hwSubs = await HomeworkSubmission.countDocuments({
        student: student._id,
        status: { $in:['submitted','graded','released'] },
        ...(termStart||termEnd ? { createdAt: {
          ...(termStart?{$gte:new Date(termStart)}:{}),
          ...(termEnd  ?{$lte:new Date(termEnd)}  :{})
        }} : {}),
      })

      results.push({
        studentId:  student._id,
        studentName: student.firstName + ' ' + student.lastName,
        admissionNo: student.admissionNo,
        curriculum:  student.curriculum,
        grade:       student.gradeLevel,
        avg, attRate, hwSubmissions: hwSubs,
        trend,
        riskLevel: avg!==null && avg<40 ? 'high' : avg!==null && avg<60 ? 'medium' : 'low',
      })
    }

    results.sort((a,b) => (a.avg||0) - (b.avg||0))

    return res.json({ success:true, data:{ students:results } })
  } catch(e) {
    console.error('[dos/student-trends]', e.message)
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ═══════════════════════════════════════════════════════════
// GET /api/dos/class-performance
// Compare students within same curriculum/grade — class stats.
// ═══════════════════════════════════════════════════════════
router.get('/class-performance', auth, ALLOWED, async (req, res) => {
  try {
    const { curriculum, grade, subject, termStart, termEnd } = req.query
    if (!curriculum) return res.status(400).json({ success:false, message:'curriculum is required' })

    const User = m('User'), Exam = m('Exam'), ExamSubmission = m('ExamSubmission')

    const students = await User.find({ role:'student', isActive:true, curriculum })
      .select('firstName lastName admissionNo gradeLevel').lean()

    const examFilter = { curriculum, status:{ $in:['ended','archived'] } }
    if (grade)     examFilter.grade   = grade
    if (subject)   examFilter.subject = subject
    if (termStart) examFilter.startAt = { ...examFilter.startAt, $gte: new Date(termStart) }
    if (termEnd)   examFilter.startAt = { ...examFilter.startAt, $lte: new Date(termEnd) }

    const exams = await Exam.find(examFilter).sort({ startAt:1 }).lean()
    const examIds = exams.map(e=>e._id)
    const subs = await ExamSubmission.find({ examId:{ $in:examIds }, status:'graded' }).lean()

    const studentScores = students.map(st => {
      const stSubs = subs.filter(s=>String(s.studentId)===String(st._id))
      const scores = stSubs.map(s=>{
        const ex = exams.find(e=>String(e._id)===String(s.examId))
        const awarded = (s.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
        return ex?.totalMarks>0 ? Math.round((awarded/ex.totalMarks)*100) : 0
      })
      const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null
      return { ...st, avg, examsAttempted:scores.length, scores }
    }).sort((a,b)=>(b.avg||0)-(a.avg||0))

    // Class stats
    const allScores = studentScores.flatMap(s=>s.scores)
    const classAvg = allScores.length ? Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length) : null
    const gradeDistribution = { 'A*':0,B:0,C:0,D:0,E:0,U:0 }
    allScores.forEach(sc => {
      const g = sc>=80?'A*':sc>=70?'B':sc>=60?'C':sc>=50?'D':sc>=40?'E':'U'
      gradeDistribution[g]++
    })

    return res.json({ success:true, data:{
      curriculum, grade, subject,
      classAvg, totalStudents:students.length,
      gradeDistribution, students:studentScores,
      exams: exams.map(e=>({ _id:e._id, title:e.title, subject:e.subject, date:e.startAt })),
    }})
  } catch(e) {
    console.error('[dos/class-performance]', e.message)
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ═══════════════════════════════════════════════════════════
// GET /api/dos/at-risk
// Students with avg <50%, poor attendance, or low HW submission.
// ═══════════════════════════════════════════════════════════
router.get('/at-risk', auth, ALLOWED, async (req, res) => {
  try {
    const { termStart, termEnd } = req.query
    const User = m('User'), ExamSubmission = m('ExamSubmission')
    const Exam = m('Exam'), Attendance = m('Attendance')

    const students = await User.find({ role:'student', isActive:true })
      .select('firstName lastName curriculum gradeLevel admissionNo').lean()

    const now = new Date()
    const start = termStart ? new Date(termStart) : new Date(now - 90*24*60*60*1000)
    const end   = termEnd   ? new Date(termEnd)   : now

    const exams = await Exam.find({ startAt:{ $gte:start, $lte:end }, status:{ $in:['ended','archived'] } }).lean()
    const examIds = exams.map(e=>e._id)
    const allSubs = await ExamSubmission.find({ examId:{ $in:examIds }, status:'graded' }).lean()
    const allAtt  = await Attendance.find({ date:{ $gte:start, $lte:end } }).lean()

    const atRisk = []
    for (const student of students) {
      const stSubs = allSubs.filter(s=>String(s.studentId)===String(student._id))
      const scores = stSubs.map(s=>{
        const ex = exams.find(e=>String(e._id)===String(s.examId))
        const awarded = (s.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
        return ex?.totalMarks>0 ? Math.round((awarded/ex.totalMarks)*100) : 0
      })
      const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null

      const stAtt   = allAtt.filter(a=>String(a.studentId)===String(student._id))
      const attRate = stAtt.length ? Math.round((stAtt.filter(a=>a.status==='present').length/stAtt.length)*100) : null

      const flags = []
      if (avg!==null && avg<50) flags.push({ type:'low_score', value:avg, msg:`Average score: ${avg}%` })
      if (attRate!==null && attRate<60) flags.push({ type:'low_attendance', value:attRate, msg:`Attendance: ${attRate}%` })
      if (scores.length===0 && exams.length>0) flags.push({ type:'no_exams', msg:'No exams attempted' })

      if (flags.length>0) {
        atRisk.push({
          studentId:   student._id,
          studentName: student.firstName+' '+student.lastName,
          admissionNo: student.admissionNo,
          curriculum:  student.curriculum,
          grade:       student.gradeLevel,
          avg, attRate, examsAttempted:scores.length,
          flags,
          riskLevel: flags.length>=2 ? 'high' : 'medium',
        })
      }
    }
    atRisk.sort((a,b)=> (b.flags.length-a.flags.length) || (a.avg||0)-(b.avg||0))

    return res.json({ success:true, data:{ students:atRisk, totalAtRisk:atRisk.length } })
  } catch(e) {
    console.error('[dos/at-risk]', e.message)
    return res.status(500).json({ success:false, message:e.message })
  }
})

module.exports = router
