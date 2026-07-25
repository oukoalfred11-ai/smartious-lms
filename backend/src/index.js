require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const mongoose   = require('mongoose');

const app = express();

// ── Security headers ─────────────────────────────────────
// Disable CSP in development — Vite uses inline scripts for HMR
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));

// ── CORS ─────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://smartioushomeschool.com',
  'https://www.smartioushomeschool.com',
  process.env.CLIENT_URL,           // set in .env for each environment
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many login attempts — please wait 15 minutes.' },
});

// Global limiter: 1000 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later.' },
}));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',           authLimiter, require('./routes/auth'));
app.use('/api/users',          require('./routes/users'));
app.use('/api/communication', require('./routes/communication'));
app.use('/api/payments', require('./routes/paymentRoutes'))
app.use('/api/teachers',       require('./routes/teachers'));
app.use('/api/teacher-profile', require('./routes/teacher-profile'));
app.use('/api/allocations',    require('./routes/allocations'));
app.use('/api/subjects',       require('./routes/subjects'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/syllabus-progress', require('./routes/syllabus-progress'));
app.use('/api/lesson-progress', require('./routes/lesson-progress'));
app.use('/api/curriculum',     require('./routes/curriculum'));
app.use('/api/timetables', require('./routes/timetables'));
app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/student-profile', require('./routes/student-profile'));
app.use('/api/students',       require('./routes/students'));
app.use('/api/parents', require('./routes/parents'));
app.use('/api/dashboard',      require('./routes/dashboard'));
app.use('/api/grouprooms',     require('./routes/grouprooms'));
app.use('/api/liveclasses', require('./routes/liveclasses'));
// question-bank MUST be mounted before routes/questions.js: that file
// has GET /:id, which would otherwise capture named routes such as
// /selftest and /spine and fail with "Invalid question ID".
app.use('/api/questions', require('./routes/question-bank'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/homework', require('./routes/homework'));
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/status',         require('./routes/status-management'));
app.use('/api/frontdesk', require('./routes/frontdesk'));
app.use('/api/library', require('./routes/library'));
app.use('/api/leave-requests', require('./routes/status-management'));
app.use('/api/invoices',   require('./routes/invoices'));
app.use('/api/inquiries',  require('./routes/inquiries'));
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/dos',        require('./routes/dos-analytics'));
app.use('/api/fees',       require('./routes/fee-collection'));
app.use('/api/payroll',    require('./routes/payroll'));
app.use('/api/parent',     require('./routes/parent-portal'));
app.use('/api/ratings',        require('./routes/ratings'));
app.use('/api/weekly-reports', require('./routes/weekly-reports'));
app.use('/api/seed-subjects',  require('./routes/seed-subjects'));
app.use('/api/quiz',           require('./routes/quiz'));
app.use('/api/checkin',    require('./routes/checkin'));

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` })
);

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {   // eslint-disable-line no-unused-vars
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
  });
});

// ── Timetable roll-forward promotion job ──────────────────
// Promotes near-term timetable sessions into LiveClass records.
// Best-effort daily interval (not a precise cron). On Render's
// free tier the timer pauses while the instance sleeps and
// catches up on wake — the 14-day window absorbs that lag.
const { promoteUpcomingSessions } = require('./services/timetableSync');

const runTimetablePromotion = () => {
  promoteUpcomingSessions(14)
    .then(r => console.log('[timetable promotion]', JSON.stringify(r)))
    .catch(e => console.error('[timetable promotion] failed:', e.message));
};

// ── Daily 7 AM check-in reminder ─────────────────────────────
// Fires every weekday at 07:00 school local time (EAT = UTC+3).
// Sends email to every active user who hasn't checked in yet.
const { sendDailyReminders } = require('./routes/checkin');
const { sendDueReminders  } = require('./routes/fee-collection');
const { sendClassReminders } = require('./routes/parent-portal');
const { scheduleShowCauseCron } = require('./services/showCauseCron');
try { require('./services/autoHomeworkCron').start(); } catch (e) { console.error('[auto-homework] start failed:', e.message); }

const runCheckinReminder = () => {
  const now = new Date();
  const eat = new Date(now.getTime() + 3*60*60*1000); // UTC+3
  if (eat.getDay() === 0 || eat.getDay() === 6) return; // skip weekends
  sendDailyReminders()
    .then(n => console.log('[checkin reminder] Sent', n, 'reminders'))
    .catch(e => console.error('[checkin reminder] Error:', e.message));
};

// ── Database + start ──────────────────────────────────────
const PORT        = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set. Exiting.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀  API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    );

    // Start the timetable promotion job: first run 60s after boot
    // (let the DB settle), then every 24 hours.
    setTimeout(runTimetablePromotion, 60 * 1000);
    setInterval(runTimetablePromotion, 24 * 60 * 60 * 1000);

    // Schedule daily 7 AM EAT reminder
    const scheduleReminder = () => {
      const now = new Date();
      const eat = new Date(now.getTime() + 3*60*60*1000);
      const next7am = new Date(eat);
      next7am.setHours(7, 0, 0, 0);
      if (next7am <= eat) next7am.setDate(next7am.getDate() + 1);
      const msUntil = next7am.getTime() - eat.getTime();
      console.log('[checkin] Next reminder in', Math.round(msUntil/60000), 'minutes');
      setTimeout(() => { runCheckinReminder(); setInterval(runCheckinReminder, 24*60*60*1000); }, msUntil);
    };
    scheduleReminder();

    // Fee payment reminders — daily at 8 AM EAT
    const scheduleFeeReminder = () => {
      const now = new Date();
      const eat = new Date(now.getTime() + 3*60*60*1000);
      const next8am = new Date(eat);
      next8am.setHours(8, 0, 0, 0);
      if (next8am <= eat) next8am.setDate(next8am.getDate() + 1);
      const ms = next8am.getTime() - eat.getTime();
      console.log('[fees] Next fee reminder in', Math.round(ms/60000), 'minutes');
      setTimeout(() => {
        sendDueReminders()
          .then(r => console.log('[fees] Auto-reminders sent:', r.sent, 'skipped:', r.skipped))
          .catch(e => console.error('[fees] Cron error:', e.message));
        setInterval(() => {
          sendDueReminders()
            .then(r => console.log('[fees] Auto-reminders sent:', r.sent))
            .catch(e => console.error('[fees] Cron error:', e.message));
        }, 24*60*60*1000);
      }, ms);
    };
    scheduleFeeReminder();

    // Class reminders — runs every minute, sends email 30min before class starts
    setInterval(() => {
      sendClassReminders().catch(e => console.error('[class reminder]', e.message));
    }, 60 * 1000);
    console.log('[class reminder] Cron started — checks every minute');

    // Show-cause cron — runs every Friday at 5PM EAT
    scheduleShowCauseCron();
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
