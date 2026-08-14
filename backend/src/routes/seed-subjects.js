/**
 * routes/seed-subjects.js
 * One-time endpoint to seed all missing subjects into MongoDB.
 * POST /api/seed-subjects  (admin only, idempotent - uses upsert)
 * DELETE this file after seeding is confirmed.
 */
const express = require('express')
const router  = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const Subject = require('../models/Subject')

const ALL_SUBJECTS = [
  // ── CambridgeIGCSE ──────────────────────────────────────
  { curriculum:'CambridgeIGCSE', subjectName:'Mathematics',           category:'Mathematics' },
  { curriculum:'CambridgeIGCSE', subjectName:'Additional Mathematics',category:'Mathematics' },
  { curriculum:'CambridgeIGCSE', subjectName:'Further Mathematics',   category:'Mathematics' },
  { curriculum:'CambridgeIGCSE', subjectName:'English Language',      category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'English Literature',    category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'English as a Second Language', category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'Physics',               category:'Sciences' },
  { curriculum:'CambridgeIGCSE', subjectName:'Chemistry',             category:'Sciences' },
  { curriculum:'CambridgeIGCSE', subjectName:'Biology',               category:'Sciences' },
  { curriculum:'CambridgeIGCSE', subjectName:'Combined Science',      category:'Sciences' },
  { curriculum:'CambridgeIGCSE', subjectName:'History',               category:'Humanities' },
  { curriculum:'CambridgeIGCSE', subjectName:'Geography',             category:'Humanities' },
  { curriculum:'CambridgeIGCSE', subjectName:'Economics',             category:'Business' },
  { curriculum:'CambridgeIGCSE', subjectName:'Business Studies',      category:'Business' },
  { curriculum:'CambridgeIGCSE', subjectName:'Accounting',            category:'Business' },
  { curriculum:'CambridgeIGCSE', subjectName:'Computer Science',      category:'Technology' },
  { curriculum:'CambridgeIGCSE', subjectName:'Information & Communication Technology', category:'Technology' },
  { curriculum:'CambridgeIGCSE', subjectName:'Design & Technology',   category:'Technology' },
  { curriculum:'CambridgeIGCSE', subjectName:'Art & Design',          category:'Arts' },
  { curriculum:'CambridgeIGCSE', subjectName:'Music',                 category:'Arts' },
  { curriculum:'CambridgeIGCSE', subjectName:'Drama',                 category:'Arts' },
  { curriculum:'CambridgeIGCSE', subjectName:'Physical Education',    category:'Physical Education' },
  { curriculum:'CambridgeIGCSE', subjectName:'Global Perspectives',   category:'Humanities' },
  { curriculum:'CambridgeIGCSE', subjectName:'Sociology',             category:'Humanities' },
  { curriculum:'CambridgeIGCSE', subjectName:'Psychology',            category:'Humanities' },
  { curriculum:'CambridgeIGCSE', subjectName:'Travel & Tourism',      category:'Business' },
  { curriculum:'CambridgeIGCSE', subjectName:'French',                category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'Spanish',               category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'Arabic',                category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'Swahili',               category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'Kiswahili',             category:'Languages' },
  { curriculum:'CambridgeIGCSE', subjectName:'Religious Studies',     category:'Humanities' },
  { curriculum:'CambridgeIGCSE', subjectName:'Islamic Studies',       category:'Humanities' },
  { curriculum:'CambridgeIGCSE', subjectName:'Environmental Management', category:'Sciences' },
  { curriculum:'CambridgeIGCSE', subjectName:'Marine Science',        category:'Sciences' },
  { curriculum:'CambridgeIGCSE', subjectName:'Media Studies',         category:'Arts' },

  // ── EdexcelIGCSE ────────────────────────────────────────
  { curriculum:'EdexcelIGCSE', subjectName:'Mathematics',             category:'Mathematics' },
  { curriculum:'EdexcelIGCSE', subjectName:'Further Pure Mathematics',category:'Mathematics' },
  { curriculum:'EdexcelIGCSE', subjectName:'Statistics',              category:'Mathematics' },
  { curriculum:'EdexcelIGCSE', subjectName:'English Language',        category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'English Literature',      category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'English as a Second Language', category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'Physics',                 category:'Sciences' },
  { curriculum:'EdexcelIGCSE', subjectName:'Chemistry',               category:'Sciences' },
  { curriculum:'EdexcelIGCSE', subjectName:'Biology',                 category:'Sciences' },
  { curriculum:'EdexcelIGCSE', subjectName:'Double Award Science',    category:'Sciences' },
  { curriculum:'EdexcelIGCSE', subjectName:'History',                 category:'Humanities' },
  { curriculum:'EdexcelIGCSE', subjectName:'Geography',               category:'Humanities' },
  { curriculum:'EdexcelIGCSE', subjectName:'Economics',               category:'Business' },
  { curriculum:'EdexcelIGCSE', subjectName:'Business Studies',        category:'Business' },
  { curriculum:'EdexcelIGCSE', subjectName:'Accounting',              category:'Business' },
  { curriculum:'EdexcelIGCSE', subjectName:'Commerce',                category:'Business' },
  { curriculum:'EdexcelIGCSE', subjectName:'Computer Science',        category:'Technology' },
  { curriculum:'EdexcelIGCSE', subjectName:'Information & Communication Technology', category:'Technology' },
  { curriculum:'EdexcelIGCSE', subjectName:'Design & Technology',     category:'Technology' },
  { curriculum:'EdexcelIGCSE', subjectName:'Art & Design',            category:'Arts' },
  { curriculum:'EdexcelIGCSE', subjectName:'Music',                   category:'Arts' },
  { curriculum:'EdexcelIGCSE', subjectName:'Drama',                   category:'Arts' },
  { curriculum:'EdexcelIGCSE', subjectName:'Physical Education',      category:'Physical Education' },
  { curriculum:'EdexcelIGCSE', subjectName:'Religious Studies',       category:'Humanities' },
  { curriculum:'EdexcelIGCSE', subjectName:'Islamic Studies',         category:'Humanities' },
  { curriculum:'EdexcelIGCSE', subjectName:'Sociology',               category:'Humanities' },
  { curriculum:'EdexcelIGCSE', subjectName:'Psychology',              category:'Humanities' },
  { curriculum:'EdexcelIGCSE', subjectName:'Travel & Tourism',        category:'Business' },
  { curriculum:'EdexcelIGCSE', subjectName:'French',                  category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'Spanish',                 category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'Arabic',                  category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'Swahili',                 category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'German',                  category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'Chinese',                 category:'Languages' },
  { curriculum:'EdexcelIGCSE', subjectName:'Media Studies',           category:'Arts' },

  // ── CambridgeALevel ─────────────────────────────────────
  { curriculum:'CambridgeALevel', subjectName:'Mathematics',          category:'Mathematics' },
  { curriculum:'CambridgeALevel', subjectName:'Further Mathematics',  category:'Mathematics' },
  { curriculum:'CambridgeALevel', subjectName:'English Language',     category:'Languages' },
  { curriculum:'CambridgeALevel', subjectName:'English Literature',   category:'Languages' },
  { curriculum:'CambridgeALevel', subjectName:'Physics',              category:'Sciences' },
  { curriculum:'CambridgeALevel', subjectName:'Chemistry',            category:'Sciences' },
  { curriculum:'CambridgeALevel', subjectName:'Biology',              category:'Sciences' },
  { curriculum:'CambridgeALevel', subjectName:'History',              category:'Humanities' },
  { curriculum:'CambridgeALevel', subjectName:'Geography',            category:'Humanities' },
  { curriculum:'CambridgeALevel', subjectName:'Economics',            category:'Business' },
  { curriculum:'CambridgeALevel', subjectName:'Business',             category:'Business' },
  { curriculum:'CambridgeALevel', subjectName:'Accounting',           category:'Business' },
  { curriculum:'CambridgeALevel', subjectName:'Computer Science',     category:'Technology' },
  { curriculum:'CambridgeALevel', subjectName:'Information Technology', category:'Technology' },
  { curriculum:'CambridgeALevel', subjectName:'Psychology',           category:'Humanities' },
  { curriculum:'CambridgeALevel', subjectName:'Sociology',            category:'Humanities' },
  { curriculum:'CambridgeALevel', subjectName:'Law',                  category:'Humanities' },
  { curriculum:'CambridgeALevel', subjectName:'Art & Design',         category:'Arts' },
  { curriculum:'CambridgeALevel', subjectName:'Music',                category:'Arts' },
  { curriculum:'CambridgeALevel', subjectName:'Drama',                category:'Arts' },
  { curriculum:'CambridgeALevel', subjectName:'Physical Education',   category:'Physical Education' },
  { curriculum:'CambridgeALevel', subjectName:'Global Perspectives & Research', category:'Humanities' },
  { curriculum:'CambridgeALevel', subjectName:'French',               category:'Languages' },
  { curriculum:'CambridgeALevel', subjectName:'Spanish',              category:'Languages' },
  { curriculum:'CambridgeALevel', subjectName:'Arabic',               category:'Languages' },

  // ── EdexcelALevel ────────────────────────────────────────
  { curriculum:'EdexcelALevel', subjectName:'Mathematics',            category:'Mathematics' },
  { curriculum:'EdexcelALevel', subjectName:'Further Mathematics',    category:'Mathematics' },
  { curriculum:'EdexcelALevel', subjectName:'Statistics',             category:'Mathematics' },
  { curriculum:'EdexcelALevel', subjectName:'English Language',       category:'Languages' },
  { curriculum:'EdexcelALevel', subjectName:'English Literature',     category:'Languages' },
  { curriculum:'EdexcelALevel', subjectName:'English Language & Literature', category:'Languages' },
  { curriculum:'EdexcelALevel', subjectName:'Physics',                category:'Sciences' },
  { curriculum:'EdexcelALevel', subjectName:'Chemistry',              category:'Sciences' },
  { curriculum:'EdexcelALevel', subjectName:'Biology',                category:'Sciences' },
  { curriculum:'EdexcelALevel', subjectName:'History',                category:'Humanities' },
  { curriculum:'EdexcelALevel', subjectName:'Geography',              category:'Humanities' },
  { curriculum:'EdexcelALevel', subjectName:'Economics',              category:'Business' },
  { curriculum:'EdexcelALevel', subjectName:'Business',               category:'Business' },
  { curriculum:'EdexcelALevel', subjectName:'Accounting',             category:'Business' },
  { curriculum:'EdexcelALevel', subjectName:'Computer Science',       category:'Technology' },
  { curriculum:'EdexcelALevel', subjectName:'Information Technology', category:'Technology' },
  { curriculum:'EdexcelALevel', subjectName:'Psychology',             category:'Humanities' },
  { curriculum:'EdexcelALevel', subjectName:'Sociology',              category:'Humanities' },
  { curriculum:'EdexcelALevel', subjectName:'Law',                    category:'Humanities' },
  { curriculum:'EdexcelALevel', subjectName:'Politics',               category:'Humanities' },
  { curriculum:'EdexcelALevel', subjectName:'Art & Design',           category:'Arts' },
  { curriculum:'EdexcelALevel', subjectName:'Music',                  category:'Arts' },
  { curriculum:'EdexcelALevel', subjectName:'Drama & Theatre Studies',category:'Arts' },
  { curriculum:'EdexcelALevel', subjectName:'Physical Education',     category:'Physical Education' },
  { curriculum:'EdexcelALevel', subjectName:'French',                 category:'Languages' },
  { curriculum:'EdexcelALevel', subjectName:'Spanish',                category:'Languages' },
  { curriculum:'EdexcelALevel', subjectName:'German',                 category:'Languages' },
  { curriculum:'EdexcelALevel', subjectName:'Arabic',                 category:'Languages' },

  // ── CambridgeLowerSec ────────────────────────────────────
  { curriculum:'CambridgeLowerSec', subjectName:'Mathematics',        category:'Mathematics' },
  { curriculum:'CambridgeLowerSec', subjectName:'English',            category:'Languages' },
  { curriculum:'CambridgeLowerSec', subjectName:'Science',            category:'Sciences' },
  { curriculum:'CambridgeLowerSec', subjectName:'History',            category:'Humanities' },
  { curriculum:'CambridgeLowerSec', subjectName:'Geography',          category:'Humanities' },
  { curriculum:'CambridgeLowerSec', subjectName:'Computer Science',   category:'Technology' },
  { curriculum:'CambridgeLowerSec', subjectName:'Art & Design',       category:'Arts' },
  { curriculum:'CambridgeLowerSec', subjectName:'Music',              category:'Arts' },
  { curriculum:'CambridgeLowerSec', subjectName:'Physical Education', category:'Physical Education' },
  { curriculum:'CambridgeLowerSec', subjectName:'Global Perspectives',category:'Humanities' },

  // ── EdexcelLowerSec ──────────────────────────────────────
  { curriculum:'EdexcelLowerSec', subjectName:'Mathematics',          category:'Mathematics' },
  { curriculum:'EdexcelLowerSec', subjectName:'English',              category:'Languages' },
  { curriculum:'EdexcelLowerSec', subjectName:'Science',              category:'Sciences' },
  { curriculum:'EdexcelLowerSec', subjectName:'History',              category:'Humanities' },
  { curriculum:'EdexcelLowerSec', subjectName:'Geography',            category:'Humanities' },
  { curriculum:'EdexcelLowerSec', subjectName:'Computer Science',     category:'Technology' },
  { curriculum:'EdexcelLowerSec', subjectName:'Art & Design',         category:'Arts' },
  { curriculum:'EdexcelLowerSec', subjectName:'Physical Education',   category:'Physical Education' },

  // ── CambridgePrimary ─────────────────────────────────────
  { curriculum:'CambridgePrimary', subjectName:'Mathematics',         category:'Mathematics' },
  { curriculum:'CambridgePrimary', subjectName:'English',             category:'Languages' },
  { curriculum:'CambridgePrimary', subjectName:'Science',             category:'Sciences' },
  { curriculum:'CambridgePrimary', subjectName:'Computing',           category:'Technology' },
  { curriculum:'CambridgePrimary', subjectName:'Global Perspectives', category:'Humanities' },
  { curriculum:'CambridgePrimary', subjectName:'Art & Design',        category:'Arts' },
  { curriculum:'CambridgePrimary', subjectName:'Music',               category:'Arts' },
  { curriculum:'CambridgePrimary', subjectName:'Physical Education',  category:'Physical Education' },
  { curriculum:'CambridgePrimary', subjectName:'French',              category:'Languages' },

  // ── IB Diploma (IBDP) ────────────────────────────────────
  { curriculum:'IBDP', subjectName:'Mathematics: Analysis & Approaches (HL)', category:'Mathematics' },
  { curriculum:'IBDP', subjectName:'Mathematics: Analysis & Approaches (SL)', category:'Mathematics' },
  { curriculum:'IBDP', subjectName:'Mathematics: Applications & Interpretation (HL)', category:'Mathematics' },
  { curriculum:'IBDP', subjectName:'Mathematics: Applications & Interpretation (SL)', category:'Mathematics' },
  { curriculum:'IBDP', subjectName:'English Language & Literature (HL)', category:'Languages' },
  { curriculum:'IBDP', subjectName:'English Language & Literature (SL)', category:'Languages' },
  { curriculum:'IBDP', subjectName:'English B (HL)',                    category:'Languages' },
  { curriculum:'IBDP', subjectName:'English B (SL)',                    category:'Languages' },
  { curriculum:'IBDP', subjectName:'Physics (HL)',                      category:'Sciences' },
  { curriculum:'IBDP', subjectName:'Physics (SL)',                      category:'Sciences' },
  { curriculum:'IBDP', subjectName:'Chemistry (HL)',                    category:'Sciences' },
  { curriculum:'IBDP', subjectName:'Chemistry (SL)',                    category:'Sciences' },
  { curriculum:'IBDP', subjectName:'Biology (HL)',                      category:'Sciences' },
  { curriculum:'IBDP', subjectName:'Biology (SL)',                      category:'Sciences' },
  { curriculum:'IBDP', subjectName:'Computer Science (HL)',             category:'Technology' },
  { curriculum:'IBDP', subjectName:'Computer Science (SL)',             category:'Technology' },
  { curriculum:'IBDP', subjectName:'History (HL)',                      category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'History (SL)',                      category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Geography (HL)',                    category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Geography (SL)',                    category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Economics (HL)',                    category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Economics (SL)',                    category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Business Management (HL)',          category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Business Management (SL)',          category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Psychology (HL)',                   category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Psychology (SL)',                   category:'Individuals and Societies' },
  { curriculum:'IBDP', subjectName:'Visual Arts (HL)',                  category:'The Arts' },
  { curriculum:'IBDP', subjectName:'Visual Arts (SL)',                  category:'The Arts' },
  { curriculum:'IBDP', subjectName:'Music (HL)',                        category:'The Arts' },
  { curriculum:'IBDP', subjectName:'Music (SL)',                        category:'The Arts' },
  { curriculum:'IBDP', subjectName:'Theatre (HL)',                      category:'The Arts' },
  { curriculum:'IBDP', subjectName:'Theatre (SL)',                      category:'The Arts' },
  { curriculum:'IBDP', subjectName:'French B (HL)',                     category:'Language Acquisition' },
  { curriculum:'IBDP', subjectName:'French B (SL)',                     category:'Language Acquisition' },
  { curriculum:'IBDP', subjectName:'Spanish B (HL)',                    category:'Language Acquisition' },
  { curriculum:'IBDP', subjectName:'Spanish B (SL)',                    category:'Language Acquisition' },
  { curriculum:'IBDP', subjectName:'Arabic B (HL)',                     category:'Language Acquisition' },
  { curriculum:'IBDP', subjectName:'Arabic B (SL)',                     category:'Language Acquisition' },
  { curriculum:'IBDP', subjectName:'Theory of Knowledge',              category:'IB Core' },
  { curriculum:'IBDP', subjectName:'Extended Essay',                    category:'IB Core' },
  { curriculum:'IBDP', subjectName:'Creativity, Activity, Service (CAS)', category:'IB Core' },
  { curriculum:'IBDP', subjectName:'Environmental Systems & Societies', category:'Sciences' },

  // ── IB Primary Years (IBPYP, Grade 1-5) ──────────────────
  { curriculum:'IBPYP', subjectName:'PYP Language',                   category:'Language and Literature' },
  { curriculum:'IBPYP', subjectName:'PYP Mathematics',                category:'Mathematics' },
  { curriculum:'IBPYP', subjectName:'PYP Science',                    category:'Sciences' },
  { curriculum:'IBPYP', subjectName:'PYP Social Studies',             category:'Individuals and Societies' },
  { curriculum:'IBPYP', subjectName:'PYP Arts',                       category:'The Arts' },
  { curriculum:'IBPYP', subjectName:'PYP Personal, Social & Physical Education', category:'Physical Education' },

  // ── IB Middle Years (IBMYP, Grade 6-10) ──────────────────
  { curriculum:'IBMYP', subjectName:'MYP Language & Literature (English)', category:'Language and Literature' },
  { curriculum:'IBMYP', subjectName:'MYP Language Acquisition (French)',  category:'Language Acquisition' },
  { curriculum:'IBMYP', subjectName:'MYP Language Acquisition (Spanish)', category:'Language Acquisition' },
  { curriculum:'IBMYP', subjectName:'MYP Individuals & Societies',    category:'Individuals and Societies' },
  { curriculum:'IBMYP', subjectName:'MYP Sciences',                   category:'Sciences' },
  { curriculum:'IBMYP', subjectName:'MYP Mathematics',                category:'Mathematics' },
  { curriculum:'IBMYP', subjectName:'MYP Design',                     category:'Technology' },
  { curriculum:'IBMYP', subjectName:'MYP Arts',                       category:'The Arts' },
  { curriculum:'IBMYP', subjectName:'MYP Physical & Health Education', category:'Physical Education' },

  // ── American ─────────────────────────────────────────────
  { curriculum:'American', subjectName:'Algebra I',                   category:'Mathematics' },
  { curriculum:'American', subjectName:'Algebra II',                  category:'Mathematics' },
  { curriculum:'American', subjectName:'Geometry',                    category:'Mathematics' },
  { curriculum:'American', subjectName:'Pre-Calculus',                category:'Mathematics' },
  { curriculum:'American', subjectName:'Calculus (AP)',               category:'Mathematics' },
  { curriculum:'American', subjectName:'Statistics (AP)',             category:'Mathematics' },
  { curriculum:'American', subjectName:'English Language Arts',       category:'Languages' },
  { curriculum:'American', subjectName:'AP English Language',         category:'Languages' },
  { curriculum:'American', subjectName:'AP English Literature',       category:'Languages' },
  { curriculum:'American', subjectName:'Biology',                     category:'Sciences' },
  { curriculum:'American', subjectName:'Chemistry',                   category:'Sciences' },
  { curriculum:'American', subjectName:'Physics',                     category:'Sciences' },
  { curriculum:'American', subjectName:'AP Biology',                  category:'Sciences' },
  { curriculum:'American', subjectName:'AP Chemistry',                category:'Sciences' },
  { curriculum:'American', subjectName:'AP Physics',                  category:'Sciences' },
  { curriculum:'American', subjectName:'US History',                  category:'Humanities' },
  { curriculum:'American', subjectName:'World History',               category:'Humanities' },
  { curriculum:'American', subjectName:'AP World History',            category:'Humanities' },
  { curriculum:'American', subjectName:'AP US History',               category:'Humanities' },
  { curriculum:'American', subjectName:'Economics',                   category:'Business' },
  { curriculum:'American', subjectName:'AP Economics',                category:'Business' },
  { curriculum:'American', subjectName:'Business',                    category:'Business' },
  { curriculum:'American', subjectName:'Computer Science',            category:'Technology' },
  { curriculum:'American', subjectName:'AP Computer Science',         category:'Technology' },
  { curriculum:'American', subjectName:'Psychology',                  category:'Humanities' },
  { curriculum:'American', subjectName:'Sociology',                   category:'Humanities' },
  { curriculum:'American', subjectName:'Art',                         category:'Arts' },
  { curriculum:'American', subjectName:'Music',                       category:'Arts' },
  { curriculum:'American', subjectName:'Physical Education',          category:'Physical Education' },
  { curriculum:'American', subjectName:'Spanish',                     category:'Languages' },
  { curriculum:'American', subjectName:'French',                      category:'Languages' },

  // ── KenyaCBE (was KenyaCBC; renamed 2026-08) ─────────────
  { curriculum:'KenyaCBE', subjectName:'Mathematics',                 category:'Mathematics' },
  { curriculum:'KenyaCBE', subjectName:'English',                     category:'Languages' },
  { curriculum:'KenyaCBE', subjectName:'Kiswahili',                   category:'Languages' },
  { curriculum:'KenyaCBE', subjectName:'Integrated Science',          category:'Sciences' },
  { curriculum:'KenyaCBE', subjectName:'Biology',                     category:'Sciences' },
  { curriculum:'KenyaCBE', subjectName:'Chemistry',                   category:'Sciences' },
  { curriculum:'KenyaCBE', subjectName:'Physics',                     category:'Sciences' },
  { curriculum:'KenyaCBE', subjectName:'History & Government',        category:'Humanities' },
  { curriculum:'KenyaCBE', subjectName:'Geography',                   category:'Humanities' },
  { curriculum:'KenyaCBE', subjectName:'Christian Religious Education', category:'Humanities' },
  { curriculum:'KenyaCBE', subjectName:'Islamic Religious Education', category:'Humanities' },
  { curriculum:'KenyaCBE', subjectName:'Business Studies',            category:'Business' },
  { curriculum:'KenyaCBE', subjectName:'Computer Studies',            category:'Technology' },
  { curriculum:'KenyaCBE', subjectName:'Agriculture',                 category:'STEM' },
  { curriculum:'KenyaCBE', subjectName:'Home Science',                category:'Life Skills' },
  { curriculum:'KenyaCBE', subjectName:'Art & Craft',                 category:'Arts' },
  { curriculum:'KenyaCBE', subjectName:'Music',                       category:'Arts' },
  { curriculum:'KenyaCBE', subjectName:'Physical Education',          category:'Physical Education' },
  { curriculum:'KenyaCBE', subjectName:'Social Studies',              category:'Social Studies' },
  { curriculum:'KenyaCBE', subjectName:'Creative Arts',               category:'Arts' },

  // ── KCSE (Form 3-4 only, phasing out) ────────────────────
  // Separate from CBE so the whole curriculum can be removed in one move
  // when the last cohort sits the exam.
  { curriculum:'KCSE', subjectName:'English',                       category:'Languages' },
  { curriculum:'KCSE', subjectName:'Kiswahili',                     category:'Languages' },
  { curriculum:'KCSE', subjectName:'Mathematics',                   category:'Mathematics' },
  { curriculum:'KCSE', subjectName:'Biology',                       category:'Sciences' },
  { curriculum:'KCSE', subjectName:'Chemistry',                     category:'Sciences' },
  { curriculum:'KCSE', subjectName:'Physics',                       category:'Sciences' },
  { curriculum:'KCSE', subjectName:'Geography',                     category:'Humanities' },
  { curriculum:'KCSE', subjectName:'History & Government',          category:'Humanities' },
  { curriculum:'KCSE', subjectName:'Christian Religious Education', category:'Humanities' },
  { curriculum:'KCSE', subjectName:'Business Studies',              category:'Business' },
  { curriculum:'KCSE', subjectName:'Agriculture',                   category:'STEM' },
  { curriculum:'KCSE', subjectName:'Computer Studies',              category:'Technology' },

  // ── BNC ──────────────────────────────────────────────────
  { curriculum:'BNC', subjectName:'Mathematics',                      category:'Core' },
  { curriculum:'BNC', subjectName:'English',                          category:'English' },
  { curriculum:'BNC', subjectName:'Science',                          category:'Core' },
  { curriculum:'BNC', subjectName:'History',                          category:'Humanities' },
  { curriculum:'BNC', subjectName:'Geography',                        category:'Humanities' },
  { curriculum:'BNC', subjectName:'Computing',                        category:'Technology' },
  { curriculum:'BNC', subjectName:'Design & Technology',              category:'Design' },
  { curriculum:'BNC', subjectName:'Art & Design',                     category:'Arts' },
  { curriculum:'BNC', subjectName:'Music',                            category:'Arts' },
  { curriculum:'BNC', subjectName:'Drama',                            category:'Arts' },
  { curriculum:'BNC', subjectName:'Physical Education',               category:'Physical Education' },
  { curriculum:'BNC', subjectName:'Religious Education',              category:'Humanities' },
  { curriculum:'BNC', subjectName:'PSHE',                             category:'Life Skills' },
  { curriculum:'BNC', subjectName:'Modern Foreign Languages',         category:'Languages' },
  { curriculum:'BNC', subjectName:'French',                           category:'Languages' },
  { curriculum:'BNC', subjectName:'Spanish',                          category:'Languages' },

  // ── AQALowerSec ──────────────────────────────────────────
  { curriculum:'AQALowerSec', subjectName:'Mathematics',              category:'Mathematics' },
  { curriculum:'AQALowerSec', subjectName:'English',                  category:'Languages' },
  { curriculum:'AQALowerSec', subjectName:'Science',                  category:'Sciences' },
  { curriculum:'AQALowerSec', subjectName:'History',                  category:'Humanities' },
  { curriculum:'AQALowerSec', subjectName:'Geography',                category:'Humanities' },
  { curriculum:'AQALowerSec', subjectName:'Computing',                category:'Technology' },
  { curriculum:'AQALowerSec', subjectName:'Art & Design',             category:'Arts' },
  { curriculum:'AQALowerSec', subjectName:'Physical Education',       category:'Physical Education' },

  // ── AQAGCSE ──────────────────────────────────────────────
  { curriculum:'AQAGCSE', subjectName:'Mathematics',                  category:'Mathematics' },
  { curriculum:'AQAGCSE', subjectName:'Further Mathematics',          category:'Mathematics' },
  { curriculum:'AQAGCSE', subjectName:'English Language',             category:'Languages' },
  { curriculum:'AQAGCSE', subjectName:'English Literature',           category:'Languages' },
  { curriculum:'AQAGCSE', subjectName:'Physics',                      category:'Sciences' },
  { curriculum:'AQAGCSE', subjectName:'Chemistry',                    category:'Sciences' },
  { curriculum:'AQAGCSE', subjectName:'Biology',                      category:'Sciences' },
  { curriculum:'AQAGCSE', subjectName:'Combined Science',             category:'Sciences' },
  { curriculum:'AQAGCSE', subjectName:'History',                      category:'Humanities' },
  { curriculum:'AQAGCSE', subjectName:'Geography',                    category:'Humanities' },
  { curriculum:'AQAGCSE', subjectName:'Economics',                    category:'Business' },
  { curriculum:'AQAGCSE', subjectName:'Business Studies',             category:'Business' },
  { curriculum:'AQAGCSE', subjectName:'Accounting',                   category:'Business' },
  { curriculum:'AQAGCSE', subjectName:'Computer Science',             category:'Technology' },
  { curriculum:'AQAGCSE', subjectName:'Psychology',                   category:'Humanities' },
  { curriculum:'AQAGCSE', subjectName:'Sociology',                    category:'Humanities' },
  { curriculum:'AQAGCSE', subjectName:'Art & Design',                 category:'Arts' },
  { curriculum:'AQAGCSE', subjectName:'Music',                        category:'Arts' },
  { curriculum:'AQAGCSE', subjectName:'Drama',                        category:'Arts' },
  { curriculum:'AQAGCSE', subjectName:'Physical Education',           category:'Physical Education' },
  { curriculum:'AQAGCSE', subjectName:'Religious Studies',            category:'Humanities' },
  { curriculum:'AQAGCSE', subjectName:'French',                       category:'Languages' },
  { curriculum:'AQAGCSE', subjectName:'Spanish',                      category:'Languages' },
  { curriculum:'AQAGCSE', subjectName:'German',                       category:'Languages' },

  // ── AQAALevel ────────────────────────────────────────────
  { curriculum:'AQAALevel', subjectName:'Mathematics',                category:'Mathematics' },
  { curriculum:'AQAALevel', subjectName:'Further Mathematics',        category:'Mathematics' },
  { curriculum:'AQAALevel', subjectName:'English Language',           category:'Languages' },
  { curriculum:'AQAALevel', subjectName:'English Literature',         category:'Languages' },
  { curriculum:'AQAALevel', subjectName:'Physics',                    category:'Sciences' },
  { curriculum:'AQAALevel', subjectName:'Chemistry',                  category:'Sciences' },
  { curriculum:'AQAALevel', subjectName:'Biology',                    category:'Sciences' },
  { curriculum:'AQAALevel', subjectName:'History',                    category:'Humanities' },
  { curriculum:'AQAALevel', subjectName:'Geography',                  category:'Humanities' },
  { curriculum:'AQAALevel', subjectName:'Economics',                  category:'Business' },
  { curriculum:'AQAALevel', subjectName:'Business',                   category:'Business' },
  { curriculum:'AQAALevel', subjectName:'Computer Science',           category:'Technology' },
  { curriculum:'AQAALevel', subjectName:'Psychology',                 category:'Humanities' },
  { curriculum:'AQAALevel', subjectName:'Sociology',                  category:'Humanities' },
  { curriculum:'AQAALevel', subjectName:'Law',                        category:'Humanities' },
  { curriculum:'AQAALevel', subjectName:'Politics',                   category:'Humanities' },
  { curriculum:'AQAALevel', subjectName:'Art & Design',               category:'Arts' },
  { curriculum:'AQAALevel', subjectName:'Music',                      category:'Arts' },
  { curriculum:'AQAALevel', subjectName:'Physical Education',         category:'Physical Education' },
  { curriculum:'AQAALevel', subjectName:'French',                     category:'Languages' },
  { curriculum:'AQAALevel', subjectName:'Spanish',                    category:'Languages' },
  { curriculum:'AQAALevel', subjectName:'German',                     category:'Languages' },

  // ── Canadian ─────────────────────────────────────────────
  { curriculum:'Canadian', subjectName:'Mathematics',                 category:'Mathematics' },
  { curriculum:'Canadian', subjectName:'English Language Arts',       category:'Languages' },
  { curriculum:'Canadian', subjectName:'Science',                     category:'Sciences' },
  { curriculum:'Canadian', subjectName:'Biology',                     category:'Sciences' },
  { curriculum:'Canadian', subjectName:'Chemistry',                   category:'Sciences' },
  { curriculum:'Canadian', subjectName:'Physics',                     category:'Sciences' },
  { curriculum:'Canadian', subjectName:'History',                     category:'Humanities' },
  { curriculum:'Canadian', subjectName:'Geography',                   category:'Humanities' },
  { curriculum:'Canadian', subjectName:'Economics',                   category:'Business' },
  { curriculum:'Canadian', subjectName:'Business',                    category:'Business' },
  { curriculum:'Canadian', subjectName:'Computer Science',            category:'Technology' },
  { curriculum:'Canadian', subjectName:'Art',                         category:'Arts' },
  { curriculum:'Canadian', subjectName:'Music',                       category:'Arts' },
  { curriculum:'Canadian', subjectName:'Physical Education',          category:'Physical Education' },
  { curriculum:'Canadian', subjectName:'French',                      category:'Languages' },
]

// POST /api/seed-subjects
router.post('/', auth, requireRole('admin','ops_manager'), async (req, res) => {
  try {
    let inserted = 0, skipped = 0, errors = [], reactivationsAvoided = 0

    for (const s of ALL_SUBJECTS) {
      try {
        // $setOnInsert, NOT $set, for isActive.
        //
        // The seeder used to force isActive:true on every subject in its
        // list. That silently undid deliberate curation: a school that had
        // deactivated Art & Design and Physical Education at Lower
        // Secondary found them back the next time anyone ran this. Category
        // is still refreshed on existing records — that is a correction, not
        // a policy decision — but whether a subject is offered is the
        // school's choice and the seeder must not overrule it.
        const before = await Subject.findOne({
          curriculum: s.curriculum, subjectName: s.subjectName,
        }).select('_id').lean()

        await Subject.findOneAndUpdate(
          { curriculum: s.curriculum, subjectName: s.subjectName },
          {
            $set: { category: s.category },
            $setOnInsert: { isActive: true },
          },
          { upsert: true, new: true }
        )
        if (before) reactivationsAvoided++
        inserted++
      } catch(e) {
        if (e.code === 11000) { skipped++; continue }
        errors.push(`${s.curriculum}/${s.subjectName}: ${e.message}`)
      }
    }

    return res.json({
      success: true,
      message: `Seeded ${inserted} subject(s). ${reactivationsAvoided} already existed and kept `
             + `their current active/inactive state. ${skipped} skipped, ${errors.length} error(s).`,
      data: { inserted, skipped, existing: reactivationsAvoided, errors: errors.slice(0, 10) }
    })
  } catch(e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// GET /api/seed-subjects/count — check counts per curriculum
router.get('/count', auth, requireRole('admin','ops_manager'), async (req, res) => {
  try {
    const counts = await Subject.aggregate([
      { $group: { _id: '$curriculum', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
    return res.json({ success: true, data: { counts } })
  } catch(e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

module.exports = router
