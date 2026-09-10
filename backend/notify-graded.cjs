/* Backfill graded exam submissions and email parents a results digest
   with an integrity score per paper.

   Integrity score method (stated in the email):
   - Time consistency: the server measures time spent itself; the
     score starts from min/max ratio of server vs client reported
     time as a percentage (100 when they agree).
   - Tab switches: 5 points deducted per tab switch, up to 30.
   - Flagged papers are capped at 60 and the reason is shown.
   Bands: 90+ Excellent, 70+ Good, 50+ Review advised, below 50
   Attention needed. */
const mongoose = require('mongoose');

const DRY = process.env.DRY_RUN !== '0';
const FORCE = process.env.FORCE === '1';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./src/models/User');
  const Exam = require('./src/models/Exam');
  const ExamSubmission = require('./src/models/ExamSubmission');

  let mailer = null;
  try { mailer = require('nodemailer').createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  }); } catch (e) { console.log('mailer unavailable:', e.message); }
  const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const subs = await ExamSubmission.find({ status: { $in: ['graded', 'returned'] } })
    .populate('examId', 'title subject curriculum totalMarks startAt')
    .populate('studentId', 'firstName lastName')
    .lean();
  console.log('graded or returned submissions found:', subs.length);

  // 1. Backfill totalScore where zero but answers carry marks.
  let backfilled = 0;
  for (const s of subs) {
    const sum = (s.answers || []).reduce((t, a) => t + (a.marksAwarded || 0), 0);
    if ((!s.totalScore || s.totalScore === 0) && sum > 0) {
      if (!DRY) await ExamSubmission.updateOne({ _id: s._id }, { $set: { totalScore: sum } });
      s.totalScore = sum;
      backfilled += 1;
    }
  }
  console.log((DRY ? 'would backfill' : 'backfilled') + ' totalScore on:', backfilled);

  // 2. Integrity score per paper.
  const integrity = (s) => {
    const a = s.timeSpentSecs || 0, b = s.clientReportedSecs || 0;
    let score = (a > 0 && b > 0) ? Math.round(Math.min(a, b) / Math.max(a, b) * 100) : 100;
    score -= Math.min((s.tabSwitches || 0) * 5, 30);
    score = Math.max(0, score);
    if (s.flagged) score = Math.min(score, 60);
    const band = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Review advised' : 'Attention needed';
    return { score, band };
  };

  // 3. Group papers per parent (linkedStudents), skipping already
  //    notified papers unless FORCE=1.
  const pending = subs.filter(s => s.studentId && s.examId && (FORCE || !s.parentNotifiedAt));
  console.log('papers to notify parents about:', pending.length);
  const byStudent = {};
  pending.forEach(s => { (byStudent[String(s.studentId._id)] = byStudent[String(s.studentId._id)] || []).push(s); });

  const parents = await User.find({ linkedStudents: { $in: Object.keys(byStudent) } })
    .select('firstName lastName email linkedStudents').lean();
  console.log('parents linked to those students:', parents.length);

  let sent = 0, marked = 0;
  for (const parent of parents) {
    if (!parent.email) continue;
    const theirPapers = (parent.linkedStudents || [])
      .flatMap(id => byStudent[String(id)] || []);
    if (!theirPapers.length) continue;

    const rows = theirPapers.map(s => {
      const ig = integrity(s);
      const total = s.examId.totalMarks || 0;
      const pct = total ? Math.round((s.totalScore || 0) / total * 100) : null;
      return '<tr>'
        + '<td style="padding:7px 10px;border:1px solid #e5dfd3">' + [s.studentId.firstName, s.studentId.lastName].filter(Boolean).join(' ') + '</td>'
        + '<td style="padding:7px 10px;border:1px solid #e5dfd3">' + (s.examId.title || '') + '<br><span style="color:#8a8378;font-size:11px">' + (s.examId.subject || '') + '</span></td>'
        + '<td style="padding:7px 10px;border:1px solid #e5dfd3;text-align:center"><b>' + (s.totalScore ?? 0) + '</b> / ' + total + (pct !== null ? ' (' + pct + '%)' : '') + '</td>'
        + '<td style="padding:7px 10px;border:1px solid #e5dfd3;text-align:center"><b style="color:' + (ig.score >= 70 ? '#15803D' : ig.score >= 50 ? '#B45309' : '#B91C1C') + '">' + ig.score + '%</b><br><span style="font-size:11px;color:#8a8378">' + ig.band + (s.flagged && s.flagReason ? ' \u00b7 ' + s.flagReason : '') + '</span></td>'
        + '</tr>';
    }).join('');

    const html = '<div style="font-family:Georgia,serif;color:#231715;max-width:640px;margin:auto">'
      + '<h2 style="color:#7D1025;margin-bottom:2px">Smartious Homeschool</h2>'
      + '<div style="color:#8a8378;font-size:12px;margin-bottom:14px">Marked and graded examination results</div>'
      + '<p style="font-size:14px">Dear ' + (parent.firstName || 'Parent') + ',</p>'
      + '<p style="font-size:14px">The following examination papers have been marked and graded. You can view full details any time in your Parent Portal under Academic Reports, Exams.</p>'
      + '<table style="border-collapse:collapse;width:100%;font-size:13px">'
      + '<tr style="background:#F7F2EA;color:#7D1025"><th style="padding:7px 10px;border:1px solid #e5dfd3;text-align:left">Student</th><th style="padding:7px 10px;border:1px solid #e5dfd3;text-align:left">Exam</th><th style="padding:7px 10px;border:1px solid #e5dfd3">Score</th><th style="padding:7px 10px;border:1px solid #e5dfd3">Integrity</th></tr>'
      + rows + '</table>'
      + '<p style="font-size:11px;color:#8a8378;margin-top:12px"><b>About the integrity score.</b> Our examination system measures the time each paper actually took on our servers, compares it with the time reported by the device, and records focus changes during the sitting. The score reflects how consistently the paper was sat: 90 and above is excellent, 70 and above is good, and lower scores simply mean our academic team gives the sitting a closer look. It is a supervision aid, not an accusation.</p>'
      + '<p style="font-size:12px;color:#8a8378">Smartious Homeschool \u00b7 Est. 2018 \u00b7 smartioushomeschool.com</p>'
      + '</div>';

    if (DRY) {
      console.log('[DRY] would email', parent.email, 'about', theirPapers.length, 'paper(s)');
    } else if (mailer && FROM) {
      try {
        await mailer.sendMail({ from: FROM, to: parent.email, subject: 'Marked exam results for your child \u00b7 Smartious Homeschool', html });
        sent += 1;
        for (const s of theirPapers) {
          await ExamSubmission.updateOne({ _id: s._id }, { $set: { parentNotifiedAt: new Date() } }, { strict: false });
          marked += 1;
        }
      } catch (e) { console.log('send failed for', parent.email, ':', e.message); }
    }
  }
  console.log(DRY ? 'DRY RUN complete. Nothing sent, nothing written.' : `Done. Emails sent: ${sent}. Papers marked notified: ${marked}.`);
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
