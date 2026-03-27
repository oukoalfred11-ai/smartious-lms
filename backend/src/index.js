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
// Global limiter: 200 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later.' },
}));

// Stricter limiter on auth routes: 20 req / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts — please wait 15 minutes.' },
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/lessons',       require('./routes/lessons'));
app.use('/api/exams',         require('./routes/exams'));
app.use('/api/progress',      require('./routes/progress'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/mastery',       require('./routes/mastery'));
app.use('/api/adaptive',      require('./routes/adaptive'));

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
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
