/**
 * lib/imapLite.js — the few IMAP commands the bounce scanner needs
 * (lib/bounceScanner.js), over Node's tls, with no extra dependency.
 *
 *   const c = await connect({ host, port, user, pass })
 *   await c.cmd('SELECT INBOX')
 *   const r = await c.cmd('UID SEARCH ...')   // { ok, lines, literals, text }
 *   await c.logout()
 *
 * Each command resolves when its tagged reply arrives. Untagged lines are
 * collected in `lines`, and literals ({n} followed by n bytes, used for
 * message bodies) in `literals`, in order. A NO or BAD reply rejects.
 */
const tls = require('tls')
const net = require('net')

function connect({ host, port = 993, user, pass, secure = true, timeoutMs = 30000 }) {
  return new Promise((resolve, reject) => {
    const sock = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port })
    sock.setTimeout(timeoutMs, () => sock.destroy(new Error('IMAP timeout')))
    let buf = Buffer.alloc(0)
    let greeted = false
    let pending = null            // { tag, lines, literals, resolve, reject }
    let tagN = 0
    let literalLeft = 0, literalChunks = []

    const fail = (e) => { if (pending) { pending.reject(e); pending = null } else if (!greeted) reject(e) }
    sock.on('error', fail)
    sock.on('close', () => fail(new Error('IMAP connection closed')))

    sock.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk])
      for (;;) {
        if (literalLeft > 0) {
          const take = Math.min(literalLeft, buf.length)
          if (!take) return
          literalChunks.push(buf.subarray(0, take)); buf = buf.subarray(take); literalLeft -= take
          if (literalLeft === 0 && pending) pending.literals.push(Buffer.concat(literalChunks).toString('utf8'))
          continue
        }
        const nl = buf.indexOf('\r\n')
        if (nl < 0) return
        const line = buf.subarray(0, nl).toString('utf8'); buf = buf.subarray(nl + 2)
        if (!greeted) {
          greeted = true
          if (/^\* (OK|PREAUTH)/i.test(line)) resolve(api)
          else { reject(new Error('IMAP greeting: ' + line)); sock.destroy() }
          continue
        }
        if (!pending) continue
        const lit = /\{(\d+)\}$/.exec(line)
        if (lit) { literalLeft = Number(lit[1]); literalChunks = [] }
        if (line.startsWith(pending.tag + ' ')) {
          const p = pending; pending = null
          if (/^\S+ OK/i.test(line)) p.resolve({ ok: true, lines: p.lines, literals: p.literals, text: line })
          else p.reject(new Error('IMAP: ' + line.slice(p.tag.length + 1)))
        } else pending.lines.push(line)
      }
    })

    const cmd = (command) => new Promise((res, rej) => {
      if (pending) return rej(new Error('IMAP: one command at a time'))
      const tag = 'S' + (++tagN)
      pending = { tag, lines: [], literals: [], resolve: res, reject: rej }
      sock.write(tag + ' ' + command + '\r\n')
    })
    const quote = (s) => '"' + String(s).replace(/(["\\])/g, '\\$1') + '"'
    const api = {
      cmd, quote,
      login: () => cmd('LOGIN ' + quote(user) + ' ' + quote(pass)),
      logout: async () => { try { await cmd('LOGOUT') } catch {} sock.end() },
      close: () => sock.destroy(),
    }
  })
}

/** "05-Oct-2026": the date format IMAP SEARCH SINCE expects. */
function imapDate(d) {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return String(d.getUTCDate()).padStart(2, '0') + '-' + M[d.getUTCMonth()] + '-' + d.getUTCFullYear()
}

module.exports = { connect, imapDate }
