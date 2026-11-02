/**
 * lib/leadEmails.js — the email templates for lead campaigns (routes/leads.js).
 *
 *   TEMPLATES                      key → { label, audience, subject, preheader }
 *   renderLeadEmail(key, lead, opts) → { subject, html, text }
 *     lead: { type: 'assessment'|'inquiry', parentName, childName, ref }
 *     opts: { subject?, message?, unsubUrl, origin }
 *
 * One premium layout (crimson header with the school logo, a gold rule,
 * a headline, the body, a three-point "why" band, one clear button, a
 * personal sign-off and an unsubscribe footer), written as table HTML
 * with inline styles so it renders in Gmail, Outlook and phone mail apps.
 *
 * Claims stay within what the site states: live online classes, a
 * Cambridge registered school and Pearson Edexcel approved centre,
 * families in 40+ countries, founded 2018, fees from USD 423/month for
 * Primary, January 2027 intake (Term 2 starts 5 January 2027).
 * Pure: no database, so it is unit-tested (test/leadEmails.test.js).
 */

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || ''
const CONTACT_EMAIL = 'hello@smartioushomeschool.com'
const PHONE = '+254 745 021 212'

const TEMPLATES = {
  intake: {
    label: 'January intake is open',
    audience: 'Every family who has not enrolled',
    subject: 'Enrolment is open for January 2027',
    preheader: 'Term 2 starts on 5 January. Here is how to secure your child\'s place.',
  },
  complete: {
    label: 'Finish your application',
    audience: 'Assessment requests that were invoiced or accepted but did not enrol',
    subject: '{child}\'s place at Smartious is waiting',
    preheader: 'Your application is still open. One step to go.',
  },
  why: {
    label: 'Why families choose Smartious',
    audience: 'Enquiries and applicants still deciding',
    subject: 'Why families in 40+ countries choose Smartious',
    preheader: 'Live classes, real teachers, Cambridge and Edexcel qualifications.',
  },
  timetable: {
    label: 'Timetables are being set now',
    audience: 'Not-converted families, close to the start of term',
    subject: 'New-term timetables are being set this week',
    preheader: 'Join now and your child starts with their class on day one.',
  },
  custom: {
    label: 'Your own message',
    audience: 'Any filtered group',
    subject: 'A note from Smartious Homeschool',
    preheader: '',
  },
}

const fill = (s, v) => String(s || '').replace(/\{child\}/g, v.child).replace(/\{parent\}/g, v.parent)

// Each template's words. `v`: { parent, child, ref, applicant }
function copy(key, v) {
  const kid = v.child || 'your child'
  switch (key) {
    case 'intake': return {
      kicker: 'January 2027 intake',
      title: 'Enrolment is open for the new term',
      paras: [
        `We are welcoming new students for the January 2027 intake, and Term 2 begins on <strong>5 January 2027</strong>. ${v.applicant ? `You started an application for ${esc(kid)} with us, and we would love to help you finish it.` : `You asked us about Smartious, so we wanted you to hear first.`}`,
        `Every student joins a timetable of live online lessons with subject teachers, on their own time zone, with weekly tests and a written report each term.`,
      ],
    }
    case 'complete': return {
      kicker: 'Your application',
      title: `${esc(kid)}'s place is still waiting`,
      paras: [
        `Thank you for applying to Smartious${v.ref ? ` (reference <strong>${esc(v.ref)}</strong>)` : ''}. Your application is still open, and there is only one step left before ${esc(kid)} can join a class.`,
        `If anything held you back, whether timing, fees, the subjects or the timetable, simply reply to this email. A member of our admissions team will answer personally and help you find the right start date.`,
      ],
    }
    case 'why': return {
      kicker: 'Why Smartious',
      title: 'A real school, taught live, wherever you are',
      paras: [
        `Families in more than 40 countries choose Smartious because it feels like school, not an app: a timetable of live lessons, the same subject teachers all term, marked work and honest reports.`,
        `We teach Cambridge, Pearson Edexcel and the American curriculum with AP, from Primary to A Level, and our students sit the same international examinations as students anywhere.`,
      ],
    }
    case 'timetable': return {
      kicker: 'Starting soon',
      title: 'New-term timetables are being set now',
      paras: [
        `Our academic team is building the class timetables for the new term this week. Families who confirm now have their child placed in a class from the very first lesson.`,
        v.applicant ? `${esc(kid)}'s application is still open, so it only takes a short conversation to finish.` : `It starts with a short placement assessment, so we can place your child at exactly the right level.`,
      ],
    }
    default: return { kicker: 'Smartious Homeschool', title: '', paras: [] }
  }
}

const WHY = [
  ['Live, small classes', 'Subject teachers teaching your child in real time.'],
  ['Recognised qualifications', 'A Cambridge registered school and Pearson Edexcel approved centre.'],
  ['Clear fees', 'From USD 423/month for Primary, payable termly.'],
]

/**
 * Build one email for one family.
 */
function renderLeadEmail(key, lead = {}, opts = {}) {
  const t = TEMPLATES[key] || TEMPLATES.custom
  const origin = String(opts.origin || 'https://smartioushomeschool.com').replace(/\/$/, '')
  const v = {
    parent: firstName(lead.parentName) || 'there',
    child: firstName(lead.childName),
    ref: lead.ref || '',
    applicant: lead.type === 'assessment',
  }
  const subject = fill(opts.subject || t.subject, { child: v.child || 'Your child', parent: v.parent })
  const c = copy(key, v)
  const message = String(opts.message || '').trim()
  // Applicants continue their application by reply; enquiries book the assessment.
  const cta = v.applicant
    ? { label: 'Continue my application', href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Continuing application ' + (v.ref || ''))}` }
    : { label: 'Book your child\'s assessment', href: origin + '/assessment' }
  const title = key === 'custom' ? esc(subject) : c.title
  const paras = (key === 'custom' ? [] : c.paras).map(p => `<p style="margin:0 0 16px;font-size:15.5px;line-height:1.7;color:#2E3D55">${p}</p>`).join('')
  const personal = message ? `<div style="margin:6px 0 20px;padding:16px 18px;background:#FBF6EA;border-left:3px solid #C9973A;border-radius:6px;font-size:15px;line-height:1.7;color:#2E3D55">${esc(message).replace(/\n/g, '<br>')}</div>` : ''
  const why = WHY.map(([h, p]) => `
              <td width="33%" valign="top" style="padding:0 6px">
                <div style="font-size:20px;color:#C9973A;line-height:1">&#9670;</div>
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:#080C14;margin:6px 0 4px">${h}</div>
                <div style="font-size:12.5px;line-height:1.55;color:#5A6577">${p}</div>
              </td>`).join('')
  const preheader = fill(t.preheader, { child: v.child || 'your child', parent: v.parent })

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EFE9DD">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFE9DD;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;font-family:'Helvetica Neue',Arial,sans-serif">
  <tr><td style="background:#7D1025;background-image:linear-gradient(135deg,#8B1A2E,#5A0B1B);padding:26px 32px">
    <table role="presentation" width="100%"><tr>
      <td><img src="${origin}/brand/logo.png" alt="Smartious Homeschool" height="40" style="display:block;height:40px;border:0;background:#FFFFFF;border-radius:8px;padding:6px 10px"></td>
      <td align="right" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#F3D9A4">${esc(c.kicker)}</td>
    </tr></table>
  </td></tr>
  <tr><td style="height:4px;background:#C9973A;line-height:4px;font-size:0">&nbsp;</td></tr>
  <tr><td style="padding:34px 34px 8px">
    <p style="margin:0 0 14px;font-size:15.5px;color:#2E3D55">Dear ${esc(v.parent)},</p>
    ${title ? `<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;line-height:1.25;color:#080C14">${title}</h1>` : ''}
    ${personal}
    ${paras}
  </td></tr>
  <tr><td align="center" style="padding:8px 34px 30px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#8B1A2E">
      <a href="${cta.href}" style="display:inline-block;padding:15px 30px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px">${cta.label} &rarr;</a>
    </td></tr></table>
    <div style="font-size:12.5px;color:#5A6577;margin-top:12px">or call / WhatsApp admissions on ${PHONE}</div>
  </td></tr>
  <tr><td style="padding:24px 28px;background:#FBF6EA;border-top:1px solid #EFE4CC">
    <table role="presentation" width="100%"><tr>${why}
    </tr></table>
  </td></tr>
  <tr><td style="padding:26px 34px 30px">
    <p style="margin:0;font-size:15px;line-height:1.7;color:#2E3D55">Warm regards,<br><strong>The Admissions Team</strong><br><span style="color:#5A6577">Smartious Homeschool &middot; founded 2018 &middot; families in 40+ countries</span></p>
  </td></tr>
  <tr><td style="padding:18px 34px;background:#080C14;color:#9AA3B2;font-size:11.5px;line-height:1.7">
    Smartious Homeschool &amp; eSchool &middot; Nairobi, Kenya &middot; <a href="${origin}" style="color:#E7C77A;text-decoration:none">smartioushomeschool.com</a><br>
    You are receiving this because you contacted Smartious about admission.${opts.unsubUrl ? ` <a href="${opts.unsubUrl}" style="color:#E7C77A">Unsubscribe from these emails</a>.` : ''}
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  const strip = (h) => h.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&rarr;/g, '->').replace(/&[a-z#0-9]+;/g, ' ')
  const text = [
    `Dear ${v.parent},`, '',
    key === 'custom' ? '' : strip(c.title), '',
    message, '',
    ...(key === 'custom' ? [] : c.paras.map(strip)), '',
    `${cta.label}: ${cta.href.startsWith('mailto:') ? CONTACT_EMAIL : cta.href}`,
    `Admissions: ${PHONE}`, '',
    'Warm regards,', 'The Admissions Team, Smartious Homeschool', '',
    opts.unsubUrl ? `Unsubscribe: ${opts.unsubUrl}` : '',
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim()

  return { subject, html, text }
}

module.exports = { TEMPLATES, renderLeadEmail, firstName }
