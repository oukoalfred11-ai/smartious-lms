const router   = require('express').Router();
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { auth } = require('../middleware/auth');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Exiting.');
  process.exit(1);
}

const sign = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ─────────────────────────────────────────────────────────
// Build the safe user object returned by /login and /me.
// Single source of truth so the two endpoints can't drift
// apart. Every field the portals (student / teacher / admin)
// rely on must be listed here.
// ─────────────────────────────────────────────────────────
const buildSafeUser = (u) => ({
  _id:                   u._id,
  firstName:             u.firstName,
  lastName:              u.lastName,
  email:                 u.email,
  role:                  u.role,
  plan:                  u.plan,

  // ── Academic / enrolment ──
  curriculum:            u.curriculum            || '',
  gradeLevel:            u.gradeLevel            || '',
  grade:                 u.grade                 || u.gradeLevel || '',
  // Subjects is a list of subject names the student is enrolled in
  // (or the teacher teaches). Always return an array, never undefined,
  // so the frontend can render confidently.
  subjects:              Array.isArray(u.subjects) ? u.subjects : [],
  admissionNumber:       u.admissionNumber       || '',

  // ── Profile ──
  phone:                 u.phone                 || '',
  bio:                   u.bio                   || '',
  avatar:                u.avatar                || '',

  // ── Teacher meeting defaults ──
  // Pre-fills the live-class scheduling form so teacher doesn't paste their
  // Zoom URL every time. Empty for non-teacher users.
  defaultMeetingLink:    u.defaultMeetingLink    || '',

  // ── Gamification (mirrored from User for fast reads) ──
  xp:                    u.xp                    || 0,
  streak:                u.streak                || 0,

  // ── Auth lifecycle flags ──
  // PHASE 3-5: requirePasswordChange (renamed from forcePasswordChange)
  requirePasswordChange: u.mustChangePassword    || false,
  isEmailVerified:       u.isEmailVerified       || false,
  isActive:              u.isActive              !== false, // default true
});

// ── Login ─────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });

    user.lastActive = new Date();
    await user.save();

    res.json({ success: true, token: sign(user._id), user: buildSafeUser(user) });
  } catch (e) {
    console.error('[auth/login]', e.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ── Get current user ──────────────────────────────────────
router.get('/me', auth, (req, res) => {
  res.json({ success: true, user: buildSafeUser(req.user) });
});

// ── Mshauri AI — mastery-aware ────────────────────────────
// The frontend sends masteryContext (from /api/adaptive/mshauri-context)
// so every reply is personalised to the student's real topic scores.
router.post('/mshauri', auth, async (req, res) => {
  try {
    const { message, masteryContext } = req.body;
    if (!message)
      return res.status(400).json({ success: false, message: 'Message is required.' });

    const m    = message.toLowerCase();
    const name = req.user.firstName;
    const grade = req.user.grade || 'IGCSE Form 3';
    const curr  = req.user.curriculum || 'IGCSE';
    const ctx   = masteryContext || '';

    // Extract key data from mastery context string
    const weakMatch  = ctx.match(/Weakest topics[^:]*: ([^\n]+)/);
    const focusMatch = ctx.match(/Focus topic right now: ([^(\n]+)/);
    const weakTopics = weakMatch  ? weakMatch[1].trim()  : null;
    const focusTopic = focusMatch ? focusMatch[1].trim() : null;

    let reply = '';

    if (m.includes('hello') || m.includes('habari') || m.startsWith('hi')) {

      if (focusTopic && focusTopic !== 'not set') {
        reply = 'Habari ' + name + '! Great to see you. Based on your progress, I recommend focusing on ' + focusTopic + ' today — it needs the most attention. Would you like me to explain it, generate flashcards, or give you a quick practice set?';
      } else {
        reply = 'Habari ' + name + "! I'm Mshauri, your personalised AI tutor. I know your exact mastery levels and I'll always direct you to what matters most. What shall we work on today?";
      }

    } else if (m.includes('what should i study') || m.includes('where do i start') || m.includes('help me')) {

      if (weakTopics && weakTopics !== 'none below 60%') {
        reply = 'Based on your current progress, ' + name + ', I recommend focusing on: ' + weakTopics + '. These are below 60% mastery — work on them before moving to new topics. Shall I create a practice set for the weakest one?';
      } else {
        reply = 'You are doing well across all topics, ' + name + '! Keep revising topics between 60-80% to push them to mastery level. Your focus topic is currently ' + (focusTopic || 'not yet set') + '.';
      }

    } else if (m.includes('pythagoras')) {

      var pyEnd = (ctx.includes('Pythagoras') && ctx.includes('%'))
        ? 'I can see this is one of your active topics — want a timed practice set?'
        : 'Shall I generate some practice questions at your level?';
      reply = 'Pythagoras Theorem: c squared = a squared + b squared, where c is the hypotenuse. Always identify the right angle first. Key triples to memorise: (3,4,5), (5,12,13), (8,15,17). ' + pyEnd;

    } else if (m.includes('chemistry') || m.includes('periodic table') || m.includes('stoichiometry')) {

      var chemEnd = (weakTopics && weakTopics.includes('Stoichiometry'))
        ? 'I can see Stoichiometry is a weak area for you right now. Focus there — it is heavily tested.'
        : 'Which area would you like help with?';
      reply = 'For IGCSE Chemistry, the four biggest mark-earners are: Atomic structure, Chemical bonding, Stoichiometry, and Organic chemistry. ' + chemEnd;

    } else if (m.includes('algebra') || m.includes('equation') || m.includes('quadratic')) {

      var algEnd = m.includes('quadratic')
        ? 'For IGCSE, always try factorising first — it is faster.'
        : 'What specific type of algebra question are you working on?';
      reply = 'Algebra tip for ' + name + ': Always check — are you solving (find x), simplifying (tidy the expression), or factorising (write as brackets)? The quadratic formula is x = (-b +/- sqrt(b^2 - 4ac)) / 2a. ' + algEnd;

    } else if (m.includes('flashcard') || m.includes('revise') || m.includes('memorise')) {

      if (focusTopic && focusTopic !== 'not set') {
        reply = "I'll generate flashcards for " + focusTopic + " — that is your current priority topic. Use the Flashcards tab in the Lesson Player, or ask me to explain any card in more detail.";
      } else {
        reply = "Great idea! Flashcards work best for topics you're between 40-70% on — just enough to remember but still shaky. Which topic shall we make flashcards for?";
      }

    } else if (m.includes('exam') || m.includes('past paper') || m.includes('test')) {

      var examEnd = (weakTopics && weakTopics !== 'none below 60%')
        ? 'Your weakest topics right now are: ' + weakTopics + '. Drill these with past paper questions before attempting full papers.'
        : 'You look ready to start full paper practice!';
      reply = 'For exam preparation, ' + name + ': (1) Do past paper questions topic by topic, not full papers yet. (2) Time yourself from the start. (3) Mark your own answers before checking — this builds metacognition. ' + examEnd;

    } else if (m.includes('progress') || m.includes('how am i doing') || m.includes('score')) {

      var xpMatch = ctx.match(/Total XP: (\d+)/);
      var xpVal   = xpMatch ? xpMatch[1] : null;
      var subjLine = '';
      if (ctx.includes('Subject averages:')) {
        subjLine = ctx.split('Subject averages:')[1].split('\n')[0].trim();
      }
      if (ctx && subjLine) {
        reply = "Here's your progress, " + name + ': ' + subjLine + '. ' + (xpVal ? 'You have earned ' + xpVal + ' XP so far. ' : '') + 'Focus areas needing attention: ' + (weakTopics || 'all looking good') + '. Consistency beats cramming every time!';
      } else {
        reply = "You're making progress, " + name + '! Complete a practice set so I can track your mastery and give you a detailed breakdown.';
      }

    } else if (m.includes('biology') || m.includes('cell') || m.includes('photosynthesis')) {

      reply = 'For IGCSE Biology, focus on: Cell structure, Photosynthesis and Respiration, Genetics, and Ecosystems. These carry the most marks. Which area would you like to work on?';

    } else if (m.includes('physics') || m.includes('force') || m.includes('newton') || m.includes('electricity')) {

      reply = 'For IGCSE Physics the most tested topics are: Forces and Motion (SUVAT), Electricity (V=IR), Waves, and Thermal physics. Always show all working in calculations — method marks count even if the final answer is wrong. What would you like to practise?';

    } else if (m.includes('english') || m.includes('essay') || m.includes('writing') || m.includes('comprehension')) {

      reply = 'For IGCSE English: In comprehension, always quote from the text and explain the effect. In writing tasks, plan for 3 minutes before you start — structure matters as much as content. Use a variety of sentence lengths and always check punctuation. Would you like tips on a specific writing type?';

    } else {

      reply = "That's a great question, " + name + '. In ' + grade + ' ' + curr + ', this connects to several topics. Can you tell me which subject this is for, and what you have already tried? That way I can give you a targeted explanation rather than a generic one.';

    }

    res.json({ success: true, reply });
  } catch (e) {
    console.error('[mshauri]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Verify email ──────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token required'
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Verification link expired. Please sign up again.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    if (decoded.action !== 'verify_email') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find user and mark as verified
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    console.log(`✓ Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified! Please set your password to continue.',
      userId: user._id
    });
  } catch (error) {
    console.error('[auth/verify-email]', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

// ── Reset password (force or voluntary) ────────────────
router.post('/reset-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password and clear force flag
    user.password = newPassword;
    user.mustChangePassword = false; // PHASE 3-5: Clear flag after successful reset
    await user.save();

    console.log(`✓ Password reset for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password updated successfully. You can now access your dashboard.'
    });
  } catch (error) {
    console.error('[auth/reset-password]', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    });
  }
});

// PHASE 7: Secure password reset endpoint
// Used when user logs in with temporary credentials and must change password
router.post('/secure-reset', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

     // Update password and clear force flag
    user.password = newPassword;
    user.mustChangePassword = false; // PHASE 3-5: Clear flag after successful reset
    await user.save();

    console.log(`✓ Secure password reset for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password updated successfully. You now have full access to your dashboard.',
      userUpdated: true
    });
  } catch (error) {
    console.error('[auth/secure-reset]', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during secure reset'
    });
  }
});

module.exports = router;
