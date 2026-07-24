/**
 * models/TeacherRating.js
 * One rating per student/parent per teacher.
 */
const mongoose = require('mongoose')

const teacherRatingSchema = new mongoose.Schema({
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  raterId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raterRole:    { type: String, enum: ['student','parent'], required: true },
  raterName:    { type: String, default: '' },
  score:        { type: Number, min: 1, max: 5, required: true },  // 1-5 stars
  comment:      { type: String, default: '' },
  // Show-cause deductions
  showCauseDeductions: [{
    amount:    { type: Number, default: 0.3 },
    reason:    { type: String, default: '' },
    date:      { type: Date,   default: Date.now },
  }],
}, { timestamps: true })

teacherRatingSchema.index({ teacherId:1, raterId:1 }, { unique: true })

// Statics
teacherRatingSchema.statics.avgForTeacher = async function(teacherId) {
  const ratings = await this.find({ teacherId }).lean()
  if (!ratings.length) return { avg: null, count: 0, breakdown: {} }
  const totalScore  = ratings.reduce((s,r) => s + r.score, 0)
  const totalDed    = ratings.reduce((s,r) => s + (r.showCauseDeductions||[]).reduce((d,x)=>d+x.amount,0), 0)
  const rawAvg      = totalScore / ratings.length
  const adj         = Math.max(0, Math.min(5, rawAvg - totalDed))
  const breakdown   = {1:0,2:0,3:0,4:0,5:0}
  ratings.forEach(r => { breakdown[r.score] = (breakdown[r.score]||0)+1 })
  return { avg: Math.round(adj*10)/10, rawAvg: Math.round(rawAvg*10)/10, count: ratings.length, breakdown, totalDeductions: Math.round(totalDed*10)/10 }
}

module.exports = mongoose.model('TeacherRating', teacherRatingSchema)
