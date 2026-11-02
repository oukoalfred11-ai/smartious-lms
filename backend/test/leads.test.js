const test = require('node:test')
const assert = require('node:assert')
const { fromAssessment, fromInquiry, markConverted, filterLeads } = require('../src/lib/leads')
const { renderLeadEmail, TEMPLATES } = require('../src/lib/leadEmails')

const A = (o = {}) => fromAssessment({ _id: 'a' + (o.n || 1), requestRef: 'SMA-1', parent1FirstName: 'Amina', parent1LastName: 'Otieno', parent1Email: 'AMINA@x.com', parent1Phone: '1', studentFirstName: 'Zara', studentLastName: 'Otieno', studentGrade: '5', countryIso: 'KE', city: 'Nairobi', curriculumInterest: ['Cambridge'], status: 'payment_pending', invoiceNo: 'SM-INV-1', createdAt: new Date('2026-09-01'), ...o })
const Q = (o = {}) => fromInquiry({ _id: 'q1', parentName: 'Ben Ade', parentEmail: 'ben@x.com', status: 'interested', createdAt: new Date('2026-10-01'), ...o })

test('a family with a student account has converted; an invoiced one without has not', () => {
  const [a, b] = markConverted([A(), A({ n: 2, parent1Email: 'other@x.com' })], [{ parentEmail: 'amina@x.com' }], [])
  assert.strictEqual(a.converted, true)
  assert.strictEqual(a.convertedHow, 'Student account')
  assert.strictEqual(b.converted, false)
})

test('a parent account counts only with a linked child; CRM "enrolled" counts', () => {
  const leads = markConverted([Q(), Q({ _id: 'q2', parentEmail: 'c@x.com', status: 'enrolled' })], [], [{ email: 'ben@x.com', kids: 0 }])
  assert.deepStrictEqual(leads.map(l => l.converted), [false, true])
  assert.strictEqual(markConverted([Q()], [], [{ email: 'ben@x.com', kids: 1 }])[0].converted, true)
})

test('an assessment request linked from an enrolled enquiry counts', () => {
  const leads = markConverted([A({ _id: 'a9' }), Q({ status: 'enrolled', assessmentRequestId: 'a9' })])
  assert.strictEqual(leads[0].converted, true)
})

test('filters: converted, source and invoiced-not-enrolled', () => {
  const leads = markConverted([A(), A({ n: 2, parent1Email: 'z@x.com', status: 'awaiting_review', invoiceNo: '' }), Q()], [{ parentEmail: 'amina@x.com' }])
  assert.strictEqual(filterLeads(leads, { converted: 'no' }).length, 2)
  assert.strictEqual(filterLeads(leads, { converted: 'yes' }).length, 1)
  assert.strictEqual(filterLeads(leads, { source: 'inquiry' }).length, 1)
  assert.strictEqual(filterLeads(markConverted([A()]), { stage: 'invoiced_not_enrolled' }).length, 1)
  assert.strictEqual(filterLeads(leads, { stage: 'invoiced_not_enrolled' }).length, 0)
  assert.strictEqual(filterLeads(leads, { q: 'ben' }).length, 1)
})

test('emails are personal, escaped and carry the unsubscribe link', () => {
  for (const key of Object.keys(TEMPLATES)) {
    const m = renderLeadEmail(key, { type: 'assessment', parentName: 'Amina <b>Otieno</b>', childName: 'Zara Otieno', ref: 'SMA-1' }, { subject: key === 'custom' ? 'Hello' : '', message: 'Hi <script>', unsubUrl: 'https://api/x' })
    assert.match(m.html, /Dear Amina/)
    assert.doesNotMatch(m.html, /<script>|<b>Otieno/)
    assert.match(m.html, /https:\/\/api\/x/)
    assert.match(m.text, /Unsubscribe: https:\/\/api\/x/)
  }
  assert.strictEqual(renderLeadEmail('complete', { type: 'assessment', childName: 'Zara Otieno' }).subject, "Zara's place at Smartious is waiting")
  assert.match(renderLeadEmail('intake', { type: 'inquiry' }).html, /\/assessment/)
  assert.match(renderLeadEmail('intake', { type: 'assessment', ref: 'SMA-9' }).html, /Continue my application/)
})
