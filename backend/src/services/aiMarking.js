/**
 * services/aiMarking.js
 * ============================================================
 * AI-ASSISTED MARKING — DORMANT BY DEFAULT.
 *
 * Teachers mark by hand until you decide otherwise. Nothing in this
 * file runs unless AI_MARKING_ENABLED === 'true' in the environment.
 *
 * To switch on later:
 *   1. Set ANTHROPIC_API_KEY on Render
 *   2. Set AI_MARKING_ENABLED=true
 *   3. Restart. No code change, no redeploy of anything else.
 *
 * Design decisions that matter:
 *   - AI NEVER releases a mark to a student. It writes a SUGGESTION
 *     that a teacher accepts or overrides. Turning this on cannot
 *     silently push a wrong grade to a parent.
 *   - The system prompt and mark scheme are sent as CACHEABLE blocks.
 *     Cached input bills at ~10% of standard, and every student
 *     answering the same question reuses the same rubric.
 *   - Marking runs on the cheapest current model. Marking against a
 *     rubric is extraction, not reasoning; it does not need a big model.
 *   - Every call logs its token usage so cost per student is visible
 *     before the bill arrives.
 */
const Question = require('../models/Question')

const CONFIG = {
  enabled:   process.env.AI_MARKING_ENABLED === 'true',
  apiKey:    process.env.ANTHROPIC_API_KEY || '',
  model:     process.env.AI_MARKING_MODEL || 'claude-haiku-4-5-20251001',
  maxPerDay: parseInt(process.env.AI_MARKING_DAILY_CAP || '2000', 10),
  // Rates per million tokens, for the cost log only. Update if they change.
  rateIn:    parseFloat(process.env.AI_MARKING_RATE_IN  || '1.00'),
  rateOut:   parseFloat(process.env.AI_MARKING_RATE_OUT || '5.00'),
}

let usedToday = 0
let usageDate = new Date().toDateString()
const stats = { calls: 0, inputTokens: 0, cachedTokens: 0, outputTokens: 0, estCostUSD: 0 }

function isEnabled() {
  return CONFIG.enabled && !!CONFIG.apiKey
}

function status() {
  return {
    enabled: CONFIG.enabled,
    apiKeyPresent: !!CONFIG.apiKey,
    ready: isEnabled(),
    model: CONFIG.model,
    dailyCap: CONFIG.maxPerDay,
    usedToday,
    stats: { ...stats, estCostUSD: Number(stats.estCostUSD.toFixed(4)) },
    note: isEnabled()
      ? 'AI marking is ACTIVE. Marks are suggestions only and still require teacher release.'
      : 'AI marking is OFF. Teachers mark by hand. Set ANTHROPIC_API_KEY and AI_MARKING_ENABLED=true to activate.',
  }
}

// ── Prompt construction ─────────────────────────────
// Two cacheable blocks: the marking instructions (identical for every
// call) and the question's mark scheme (identical for every student
// answering that question).
const SYSTEM_PROMPT = `You are marking a student's answer against a mark scheme for an IGCSE examination.

Award a mark for each point the student has made, whether or not their wording matches the scheme exactly. Credit correct science expressed in the student's own words. Do not award a mark for a point the student has not made, and do not deduct marks for extra correct material.

Respond with JSON only, in exactly this shape:
{
  "marksAwarded": <integer>,
  "pointsAwarded": [<index of each mark-scheme point credited>],
  "feedback": "<two sentences to the student: what they got right, and what was missing>",
  "confidence": "high" | "medium" | "low"
}

Set confidence to "low" if the answer is ambiguous, off-topic, blank, or if you are unsure whether a point deserves credit. A human will review every low-confidence mark.`

function buildMessages(question, studentAnswer) {
  const ms = question.markScheme || {}
  const scheme = [
    `QUESTION (${question.marks} marks): ${question.questionText}`,
    ms.modelAnswer ? `\nMODEL ANSWER: ${ms.modelAnswer}` : '',
    (ms.points || []).length
      ? '\nMARK SCHEME:\n' + ms.points.map((p, i) =>
          `[${i}] (${p.marks} mark${p.marks === 1 ? '' : 's'}) ${p.text}` +
          ((p.keywords || []).length ? `\n     accept any of: ${p.keywords.join('; ')}` : '')
        ).join('\n')
      : '',
    (ms.commonErrors || []).length
      ? '\nCOMMON ERRORS (do not credit):\n' + ms.commonErrors.map(e => `- ${e}`).join('\n')
      : '',
  ].filter(Boolean).join('\n')

  return {
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: scheme,        cache_control: { type: 'ephemeral' } },
    ],
    messages: [{ role: 'user', content: `STUDENT ANSWER:\n${studentAnswer || '(no answer given)'}` }],
  }
}

// ── Mark a single answer ────────────────────────────
async function markAnswer(questionId, studentAnswer) {
  if (!isEnabled()) return { ok: false, reason: 'AI marking is disabled' }

  const today = new Date().toDateString()
  if (today !== usageDate) { usageDate = today; usedToday = 0 }
  if (usedToday >= CONFIG.maxPerDay) {
    return { ok: false, reason: `Daily cap of ${CONFIG.maxPerDay} calls reached` }
  }

  const q = await Question.findById(questionId)
    .select('questionText marks markScheme type').lean()
  if (!q) return { ok: false, reason: 'Question not found' }
  if (q.type === 'mcq') return { ok: false, reason: 'MCQ marks itself — no API call needed' }

  const { system, messages } = buildMessages(q, studentAnswer)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: 400,
        system,
        messages,
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, reason: `API ${res.status}: ${t.slice(0, 200)}` }
    }
    const data = await res.json()

    // Usage accounting
    const u = data.usage || {}
    const fresh  = u.input_tokens || 0
    const cached = (u.cache_read_input_tokens || 0)
    const out    = u.output_tokens || 0
    usedToday++
    stats.calls++
    stats.inputTokens  += fresh
    stats.cachedTokens += cached
    stats.outputTokens += out
    stats.estCostUSD += (fresh / 1e6) * CONFIG.rateIn
                      + (cached / 1e6) * CONFIG.rateIn * 0.1
                      + (out / 1e6) * CONFIG.rateOut

    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
    let parsed
    try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) }
    catch { return { ok: false, reason: 'Could not parse model output', raw: text.slice(0, 300) } }

    const awarded = Math.max(0, Math.min(q.marks || 1, parseInt(parsed.marksAwarded, 10) || 0))
    return {
      ok: true,
      suggestion: {
        marksAwarded:  awarded,
        outOf:         q.marks || 1,
        pointsAwarded: Array.isArray(parsed.pointsAwarded) ? parsed.pointsAwarded : [],
        feedback:      String(parsed.feedback || '').slice(0, 600),
        confidence:    ['high','medium','low'].includes(parsed.confidence) ? parsed.confidence : 'low',
        markedBy:      'ai',
        model:         CONFIG.model,
        markedAt:      new Date(),
        // Never released to a student without a teacher accepting it.
        requiresTeacherApproval: true,
      },
      usage: { fresh, cached, out },
    }
  } catch (e) {
    return { ok: false, reason: e.message }
  }
}

// ── Mark a whole submission ─────────────────────────
async function markSubmission(answers = []) {
  if (!isEnabled()) return { ok: false, reason: 'AI marking is disabled' }
  const results = []
  for (const a of answers) {
    const r = await markAnswer(a.questionId, a.answer)
    results.push({ questionId: a.questionId, ...r })
  }
  const graded = results.filter(r => r.ok)
  return {
    ok: true,
    marked: graded.length,
    failed: results.length - graded.length,
    lowConfidence: graded.filter(r => r.suggestion.confidence === 'low').length,
    totalAwarded: graded.reduce((s, r) => s + r.suggestion.marksAwarded, 0),
    totalAvailable: graded.reduce((s, r) => s + r.suggestion.outOf, 0),
    results,
  }
}

function logStartupState() {
  if (isEnabled()) {
    console.log(`[aiMarking] ACTIVE — model ${CONFIG.model}, daily cap ${CONFIG.maxPerDay}. Marks are suggestions requiring teacher release.`)
  } else if (CONFIG.enabled && !CONFIG.apiKey) {
    console.warn('[aiMarking] AI_MARKING_ENABLED=true but ANTHROPIC_API_KEY is missing — staying OFF.')
  } else {
    console.log('[aiMarking] OFF — teachers mark by hand. Set ANTHROPIC_API_KEY + AI_MARKING_ENABLED=true to activate.')
  }
}

module.exports = { isEnabled, status, markAnswer, markSubmission, logStartupState, CONFIG }
