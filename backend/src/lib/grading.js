/**
 * grading.js - the grade a percentage earns, per curriculum.
 *
 * Every curriculum reports in its own language: Cambridge IGCSE in A*-G,
 * Edexcel International GCSE and AQA GCSE in 9-1, A-Level in A*-E, the IB
 * in 1-7, American schools in A-F with plus and minus, Ontario in levels,
 * Kenya CBE in EE/ME/AE/BE and KCSE on the twelve-point A to E scale.
 * Primary and lower-secondary stages get descriptive bands.
 *
 * These are the school's internal boundaries for term work. They are not
 * exam-board boundaries, which change paper by paper.
 */
const { canonCurriculum } = require('./academic')

// Each band: [minimum %, grade, word].
const SCALES = {
  igcse: {
    name: 'IGCSE A*–G',
    bands: [[90, 'A*', 'Outstanding'], [80, 'A', 'Excellent'], [70, 'B', 'Very good'], [60, 'C', 'Good'],
      [50, 'D', 'Satisfactory'], [40, 'E', 'Fair'], [30, 'F', 'Weak'], [20, 'G', 'Poor'], [0, 'U', 'Ungraded']],
  },
  gcse9: {
    name: 'GCSE 9–1',
    bands: [[90, '9', 'Exceptional'], [80, '8', 'Excellent'], [70, '7', 'Very good'], [62, '6', 'Good'],
      [54, '5', 'Strong pass'], [46, '4', 'Standard pass'], [38, '3', 'Below pass'], [30, '2', 'Weak'],
      [22, '1', 'Poor'], [0, 'U', 'Ungraded']],
  },
  alevel: {
    name: 'A-Level A*–E',
    bands: [[90, 'A*', 'Outstanding'], [80, 'A', 'Excellent'], [70, 'B', 'Very good'], [60, 'C', 'Good'],
      [50, 'D', 'Satisfactory'], [40, 'E', 'Pass'], [0, 'U', 'Ungraded']],
  },
  ib: {
    name: 'IB 1–7',
    bands: [[85, '7', 'Excellent'], [72, '6', 'Very good'], [60, '5', 'Good'], [48, '4', 'Satisfactory'],
      [36, '3', 'Mediocre'], [20, '2', 'Poor'], [0, '1', 'Very poor']],
  },
  american: {
    name: 'US A–F',
    bands: [[97, 'A+', 'Outstanding'], [93, 'A', 'Excellent'], [90, 'A-', 'Excellent'], [87, 'B+', 'Very good'],
      [83, 'B', 'Good'], [80, 'B-', 'Good'], [77, 'C+', 'Satisfactory'], [73, 'C', 'Satisfactory'],
      [70, 'C-', 'Satisfactory'], [67, 'D+', 'Below average'], [63, 'D', 'Below average'], [60, 'D-', 'Below average'],
      [0, 'F', 'Failing']],
  },
  ontario: {
    name: 'Ontario levels',
    bands: [[90, 'A+', 'Level 4+'], [85, 'A', 'Level 4'], [80, 'A-', 'Level 4'], [77, 'B+', 'Level 3'],
      [73, 'B', 'Level 3'], [70, 'B-', 'Level 3'], [67, 'C+', 'Level 2'], [63, 'C', 'Level 2'], [60, 'C-', 'Level 2'],
      [57, 'D+', 'Level 1'], [53, 'D', 'Level 1'], [50, 'D-', 'Level 1'], [0, 'R', 'Below Level 1']],
  },
  cbe: {
    name: 'CBE levels',
    bands: [[75, 'EE', 'Exceeding expectations'], [50, 'ME', 'Meeting expectations'],
      [25, 'AE', 'Approaching expectations'], [0, 'BE', 'Below expectations']],
  },
  kcse: {
    name: 'KCSE A–E',
    bands: [[80, 'A', 'Excellent'], [75, 'A-', 'Excellent'], [70, 'B+', 'Very good'], [65, 'B', 'Good'],
      [60, 'B-', 'Good'], [55, 'C+', 'Fair'], [50, 'C', 'Average'], [45, 'C-', 'Average'],
      [40, 'D+', 'Below average'], [35, 'D', 'Weak'], [30, 'D-', 'Weak'], [0, 'E', 'Poor']],
  },
  descriptive: {
    name: 'Attainment bands',
    bands: [[85, 'Exceeding', 'Working beyond the expected standard'], [70, 'Secure', 'Working at the expected standard'],
      [50, 'Developing', 'Working towards the expected standard'], [0, 'Emerging', 'Needs support to reach the standard']],
  },
}

const BY_CURRICULUM = {
  CambridgePrimary: 'descriptive', EdexcelPrimary: 'descriptive', IBPYP: 'descriptive',
  CambridgeLowerSec: 'descriptive', EdexcelLowerSec: 'descriptive', AQALowerSec: 'descriptive',
  CambridgeIGCSE: 'igcse',
  EdexcelIGCSE: 'gcse9', AQAGCSE: 'gcse9',
  CambridgeALevel: 'alevel', EdexcelALevel: 'alevel', AQAALevel: 'alevel',
  IBMYP: 'ib', IBDP: 'ib', 'IB MYP': 'ib', 'IB Diploma': 'ib',
  American: 'american', Canadian: 'ontario', IUFP: 'ontario',
  KenyaCBE: 'cbe', 'Kenya CBC': 'cbe',
  KCSE: 'kcse',
}

// BNC runs Reception to Year 13: GCSE grades in Years 10-11, A-Level in
// the sixth form, descriptive bands below.
function scaleKey(curriculum, gradeLevel = '') {
  const c = canonCurriculum(curriculum)
  if (c === 'BNC') {
    const y = parseInt(String(gradeLevel).replace(/\D+/g, ' ').trim().split(' ')[0], 10)
    if (y >= 12) return 'alevel'
    if (y >= 10) return 'gcse9'
    return 'descriptive'
  }
  return BY_CURRICULUM[c] || BY_CURRICULUM[String(curriculum || '').trim()] || 'igcse'
}

function scaleFor(curriculum, gradeLevel) {
  const key = scaleKey(curriculum, gradeLevel)
  return { key, ...SCALES[key] }
}

// The band a percentage falls in; null when there is no score.
function bandFor(curriculum, pct, gradeLevel) {
  if (pct === null || pct === undefined || pct === '' || !Number.isFinite(Number(pct))) return null
  const p = Number(pct)
  const { bands } = scaleFor(curriculum, gradeLevel)
  const b = bands.find(([min]) => p >= min) || bands[bands.length - 1]
  return { grade: b[1], word: b[2], min: b[0] }
}

function gradeFor(curriculum, pct, gradeLevel) {
  return bandFor(curriculum, pct, gradeLevel)?.grade || '—'
}

function wordFor(curriculum, grade, gradeLevel) {
  const b = scaleFor(curriculum, gradeLevel).bands.find(x => x[1] === grade)
  return b ? b[2] : ''
}

// One line for the foot of a report: "IGCSE A*–G: A* 90+ · A 80+ · ...".
// Bands that share a word (US plus/minus) are kept; the line is short.
function keyLine(curriculum, gradeLevel) {
  const s = scaleFor(curriculum, gradeLevel)
  const parts = s.bands.map(([min, g], i) => (i === s.bands.length - 1 ? `${g} <${s.bands[i - 1][0]}` : `${g} ${min}+`))
  return `${s.name}: ${parts.join(' · ')}`
}

module.exports = { SCALES, scaleKey, scaleFor, bandFor, gradeFor, wordFor, keyLine }
