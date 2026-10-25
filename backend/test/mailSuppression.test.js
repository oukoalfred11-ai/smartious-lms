const { test } = require('node:test')
const assert = require('node:assert')
const net = require('net')
const Module = require('module')

// In-memory MailSuppression model.
const store = new Map()
const fakeModel = {
  updateOne: async (q, u) => { const d = store.get(q.email) || { ...u.$setOnInsert, count: 0 }; Object.assign(d, u.$set); d.count += (u.$inc?.count || 0); store.set(q.email, d) },
  find: (q) => ({ select: () => ({ lean: async () => [...store.values()].filter(d => q.email.$in.includes(d.email)) }) }),
}
const load = Module._load
Module._load = function (req, ...rest) { return /models\/MailSuppression$/.test(req) ? fakeModel : load.call(this, req, ...rest) }
const ms = require('../src/lib/mailSuppression')
const { scanBounces } = require('../src/lib/bounceScanner')
// The model is required lazily, so the stub stays for this file.
void load

const GMAIL_NOTICE = [
  'From: Mail Delivery Subsystem <mailer-daemon@googlemail.com>',
  'To: hello@smartioushomeschool.com',
  'Subject: Delivery Status Notification (Failure)',
  'X-Failed-Recipients: wrong.parent@gmial.com',
  '',
  'Address not found',
  "Your message wasn't delivered to wrong.parent@gmial.com because the address couldn't be found, or is unable to receive mail.",
  'The response from the remote server was:',
  '550 5.1.1 The email account that you tried to reach does not exist.',
  '',
  'Reporting-MTA: dns; googlemail.com',
  'Final-Recipient: rfc822; wrong.parent@gmial.com',
  'Action: failed',
  'Status: 5.1.1',
  'Diagnostic-Code: smtp; 550 5.1.1 The email account that you tried to reach does not exist.',
  '',
  'From: Smartious <hello@smartioushomeschool.com>',
  'To: wrong.parent@gmial.com, mum@example.com',
].join('\r\n')

test('a bounce notice names only the failed recipient, never our own addresses', () => {
  assert.deepEqual(ms.bouncedRecipients(GMAIL_NOTICE, { own: ['hello@smartioushomeschool.com'] }), ['wrong.parent@gmial.com'])
  assert.deepEqual(ms.bouncedRecipients('Your message wasn’t delivered to a.b@c.org because the domain was not found.'), ['a.b@c.org'])
  assert.deepEqual(ms.bouncedRecipients('Hello, nothing failed here. Contact hello@x.com'), [])
})

test('permanent failures are told apart from temporary ones', () => {
  assert.equal(ms.isPermanentError({ responseCode: 550, response: '550 5.1.1 user unknown' }), true)
  assert.equal(ms.isPermanentError({ responseCode: 421, response: '421 4.7.0 try again later' }), false)
  assert.equal(ms.isPermanentError(new Error('Connection timeout')), false)
  const err = Object.assign(new Error("Can't send mail - all recipients were rejected"), { responseCode: 550, rejected: ['x@bad.example'] })
  assert.deepEqual(ms.rejectedAddresses(err), ['x@bad.example'])
  const single = Object.assign(new Error('550 Recipient address rejected'), { responseCode: 550 })
  assert.deepEqual(ms.rejectedAddresses(single, { to: 'Only.One@Bad.example' }), ['only.one@bad.example'])
  assert.deepEqual(ms.rejectedAddresses(single, { to: 'a@x.com, b@y.com' }), [])
})

test('suppressed addresses are recorded once and found again', async () => {
  store.clear(); ms._cache.clear()
  await ms.suppress(['A@x.com', 'a@x.com'], 'rejected', '550')
  assert.equal(store.get('a@x.com').count, 1)
  assert.deepEqual([...await ms.suppressedSet(['a@x.com', 'b@x.com'])], ['a@x.com'])
})

// A tiny IMAP server: Gmail capability, one failure notice and one normal mail.
function fakeImap(messages) {
  const log = []
  const srv = net.createServer(sock => {
    sock.write('* OK fake ready\r\n')
    let buf = ''
    sock.on('data', d => {
      buf += d
      let i
      while ((i = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2)
        const [tag, ...rest] = line.split(' '); const cmd = rest.join(' ')
        log.push(cmd)
        if (/^CAPABILITY/.test(cmd)) sock.write('* CAPABILITY IMAP4rev1 X-GM-EXT-1\r\n' + tag + ' OK\r\n')
        else if (/^LOGIN/.test(cmd)) sock.write(tag + ' OK logged in\r\n')
        else if (/^SELECT/.test(cmd)) sock.write('* 2 EXISTS\r\n' + tag + ' OK\r\n')
        else if (/^UID SEARCH/.test(cmd)) sock.write('* SEARCH ' + Object.keys(messages).join(' ') + '\r\n' + tag + ' OK\r\n')
        else if (/^UID FETCH (\d+)/.test(cmd)) { const uid = /UID FETCH (\d+)/.exec(cmd)[1]; const body = Buffer.from(messages[uid]); sock.write(`* 1 FETCH (UID ${uid} BODY[]<0> {${body.length}}\r\n`); sock.write(body); sock.write(')\r\n' + tag + ' OK\r\n') }
        else if (/^LOGOUT/.test(cmd)) { sock.write('* BYE\r\n' + tag + ' OK\r\n'); sock.end() }
        else sock.write(tag + ' OK\r\n')
      }
    })
  })
  return new Promise(r => srv.listen(0, () => r({ srv, port: srv.address().port, log })))
}

test('the scanner suppresses bounced addresses and files the notices out of the inbox', async () => {
  store.clear(); ms._cache.clear()
  process.env.EMAIL_USER = 'hello@smartioushomeschool.com'; process.env.EMAIL_PASSWORD = 'x'
  const { srv, port, log } = await fakeImap({ 7: GMAIL_NOTICE, 8: 'From: mailer-daemon@googlemail.com\r\nSubject: Delivery Status Notification (Delay)\r\n\r\nAction: delayed\r\nFinal-Recipient: rfc822; slow@x.com\r\n' })
  try {
    const r = await scanBounces({ host: '127.0.0.1', port, secure: false, now: new Date('2026-10-25T10:00:00Z') })
    assert.deepEqual(r.suppressed, ['wrong.parent@gmial.com'])
    assert.equal(r.notices, 1)
    assert.equal(r.filed, 1)
    assert.ok(store.has('wrong.parent@gmial.com') && !store.has('slow@x.com'))   // a delay is not a bounce
    assert.ok(log.includes('UID STORE 7 -X-GM-LABELS (\\Inbox)'))
    assert.ok(!log.some(l => /STORE 8/.test(l)))
    assert.ok(log.some(l => /^UID SEARCH SINCE 18-Oct-2026 OR FROM "mailer-daemon" FROM "postmaster"/.test(l)))
  } finally { srv.close() }
})
