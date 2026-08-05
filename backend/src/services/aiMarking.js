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
  // Writing a rubric is harder than applying one, so scheme generation
  // defaults to a stronger model than marking.
  schemeModel: process.env.AI_SCHEME_MODEL || 'claude-sonnet-4-6',
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
      ? 'AI marking is ACTIVE. Marks are suggestions only and still require teacher release. '
        + 'Questions with no mark scheme are marked from subject knowledge and flagged schemeless.'
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

// Used when a question has no mark scheme at all. Past-paper banks
// supply questions without answers, and a teacher cannot write 1,900
// schemes by hand. The model marks from subject knowledge instead —
// which is weaker and less consistent than marking to a rubric, so
// confidence is capped and every such mark is flagged for review.
const NO_SCHEME_PROMPT = `You are marking a student's answer to a secondary school physics question. No official mark scheme is available, so you must construct the marking points yourself from the question before you mark.

Work in this order. First decide what a full-mark answer contains, breaking it into one creditable point per mark available. For a calculation, work the answer out yourself, showing the formula, the substitution and the unit. Only then compare the student's answer against those points.

Award a mark for each point the student has made, whether or not their wording matches yours. Credit correct physics expressed in the student's own words, and credit a correct method even where the final figure is wrong. Do not deduct marks for extra correct material.

You are marking without an official scheme, so you may be wrong about what the examiner intended. Never set confidence to "high". Use "medium" only where the physics is unambiguous and the answer is clearly right or clearly wrong. Use "low" wherever the question is ambiguous, depends on a figure you cannot see, or the student's method is unorthodox but possibly valid.

Respond with JSON only, in exactly this shape:
{
  "marksAwarded": <integer>,
  "pointsAwarded": [],
  "feedback": "<two sentences to the student: what they got right, and what was missing>",
  "confidence": "medium" | "low",
  "assumedScheme": "<the marking points you constructed, one per line>"
}`

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

  // No scheme of any kind: fall back to marking from subject knowledge.
  const hasScheme = !!(ms.modelAnswer
    || (ms.points || []).length
    || (ms.acceptableAnswers || []).length)

  if (!hasScheme) {
    const context = [
      `QUESTION (${question.marks} mark${question.marks === 1 ? '' : 's'}): ${question.questionText}`,
      question.topic ? `TOPIC: ${question.topic}` : '',
      question.subtopic ? `SUBTOPIC: ${question.subtopic}` : '',
      (question.figures || []).length || question.artwork?.required
        ? 'NOTE: this question refers to a figure you cannot see. If the answer depends on it, set confidence to "low".'
        : '',
    ].filter(Boolean).join('\n')
    return {
      system: [
        { type: 'text', text: NO_SCHEME_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: context,          cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: `STUDENT ANSWER:\n${studentAnswer || '(no answer given)'}` }],
      schemeless: true,
    }
  }

  return {
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: scheme,        cache_control: { type: 'ephemeral' } },
    ],
    messages: [{ role: 'user', content: `STUDENT ANSWER:\n${studentAnswer || '(no answer given)'}` }],
    schemeless: false,
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
    .select('questionText marks markScheme type topic subtopic figures artwork').lean()
  if (!q) return { ok: false, reason: 'Question not found' }
  if (q.type === 'mcq') return { ok: false, reason: 'MCQ marks itself — no API call needed' }

  const { system, messages, schemeless } = buildMessages(q, studentAnswer)

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

    // Keep what the model assumed. These questions repeat for years, so
    // the assumed scheme plus the teacher's later corrections are what
    // eventually become a real mark scheme. Failure to record must not
    // fail the marking, so it is fire-and-forget.
    if (schemeless && parsed.assumedScheme) {
      Question.updateOne({ _id: questionId }, {
        $set: {
          'schemeLearning.lastAssumedScheme': String(parsed.assumedScheme).slice(0, 1500),
          'schemeLearning.lastMarkedAt': new Date(),
        },
        $inc: { 'schemeLearning.timesMarked': 1 },
      }).catch(e => console.error('[aiMarking] could not record assumed scheme:', e.message))
    }

    return {
      ok: true,
      suggestion: {
        marksAwarded:  awarded,
        outOf:         q.marks || 1,
        pointsAwarded: Array.isArray(parsed.pointsAwarded) ? parsed.pointsAwarded : [],
        feedback:      String(parsed.feedback || '').slice(0, 600),
        // Marking without a scheme is guesswork about examiner intent,
        // so 'high' is not available on that path however sure the
        // model claims to be.
        confidence:    (() => {
          let c = ['high','medium','low'].includes(parsed.confidence) ? parsed.confidence : 'low'
          if (schemeless && c === 'high') c = 'medium'
          return c
        })(),
        // True when no mark scheme existed and the model constructed
        // its own. Surface this in the teacher UI: these marks warrant
        // a closer look than rubric-based ones.
        schemeless:    !!schemeless,
        assumedScheme: schemeless ? String(parsed.assumedScheme || '').slice(0, 1500) : '',
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


// ── Mark scheme generation ──────────────────────────
// Past-paper banks supply questions but no answers. Those questions
// import held inactive because nothing can mark them. This writes a
// DRAFT scheme a teacher reviews and approves; it never activates a
// question on its own, for the same reason AI never releases a mark.
const SCHEME_PROMPT = `You are an experienced examiner writing a mark scheme for a secondary school physics question.

Write the scheme the way a real examiner would: one creditable point per mark, expressed so a marker can decide quickly whether a student has made that point. Credit correct physics in the student's own words, so give alternative acceptable wordings as keywords.

Where the question requires calculation, the model answer must show the full working line by line, state the formula used, and carry the correct unit. Never state a numerical answer you have not derived in the working.

If the question refers to a figure you cannot see, say so in "needsFigure" and write the scheme only as far as the text allows.

Respond with JSON only, in exactly this shape:
{
  "modelAnswer": "<the full worked answer, including units>",
  "points": [
    { "text": "<what earns this mark>", "marks": <integer>, "keywords": ["<accept>", "<accept>"] }
  ],
  "commonErrors": ["<a mistake that must not be credited>"],
  "needsFigure": <true|false>,
  "confidence": "high" | "medium" | "low"
}

The marks across all points MUST sum to exactly the total marks given. Set confidence to "low" if the question is ambiguous, depends on a figure, or you are unsure of the intended method.`

/**
 * Draft a mark scheme for one question.
 * Returns the scheme; it is the caller's job to store it as a draft.
 */
async function generateMarkScheme(questionId) {
  if (!isEnabled()) return { ok: false, reason: 'AI marking is disabled' }

  const today = new Date().toDateString()
  if (today !== usageDate) { usageDate = today; usedToday = 0 }
  if (usedToday >= CONFIG.maxPerDay) {
    return { ok: false, reason: `Daily cap of ${CONFIG.maxPerDay} calls reached` }
  }

  const q = await Question.findById(questionId)
    .select('questionText marks type subject topic subtopic grade curriculum figures').lean()
  if (!q) return { ok: false, reason: 'Question not found' }
  if (q.type === 'mcq') return { ok: false, reason: 'MCQ needs no mark scheme' }

  const context = [
    `SUBJECT: ${q.subject}`,
    q.curriculum ? `SYLLABUS: ${q.curriculum}` : '',
    q.grade ? `LEVEL: ${q.grade}` : '',
    q.topic ? `TOPIC: ${q.topic}` : '',
    q.subtopic ? `SUBTOPIC: ${q.subtopic}` : '',
    (q.figures || []).length ? 'A figure is attached to this question but is not visible to you.' : '',
  ].filter(Boolean).join('\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CONFIG.schemeModel || CONFIG.model,
        max_tokens: 1200,
        system: [
          { type: 'text', text: SCHEME_PROMPT, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: context },
        ],
        messages: [{ role: 'user', content: `QUESTION (${q.marks} mark${q.marks === 1 ? '' : 's'}):\n${q.questionText}` }],
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, reason: `API ${res.status}: ${t.slice(0, 200)}` }
    }
    const data = await res.json()

    const u = data.usage || {}
    usedToday++
    stats.calls++
    stats.inputTokens  += (u.input_tokens || 0)
    stats.cachedTokens += (u.cache_read_input_tokens || 0)
    stats.outputTokens += (u.output_tokens || 0)
    stats.estCostUSD   += ((u.input_tokens || 0) / 1e6) * CONFIG.rateIn
                        + ((u.output_tokens || 0) / 1e6) * CONFIG.rateOut

    const raw = (data.content || []).map(c => c.text || '').join('').trim()
    const json = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    let parsed
    try { parsed = JSON.parse(json) }
    catch { return { ok: false, reason: 'Model did not return valid JSON' } }

    // The scheme is useless if its marks do not add up to the tariff,
    // so this is checked rather than trusted.
    const points = Array.isArray(parsed.points) ? parsed.points : []
    const sum = points.reduce((t, p) => t + (Number(p.marks) || 0), 0)
    const balanced = sum === Number(q.marks)

    return {
      ok: true,
      scheme: {
        modelAnswer: String(parsed.modelAnswer || ''),
        points: points.map(p => ({
          text: String(p.text || ''),
          marks: Number(p.marks) || 1,
          keywords: Array.isArray(p.keywords) ? p.keywords.map(String) : [],
        })),
        acceptableAnswers: [],
        commonErrors: Array.isArray(parsed.commonErrors) ? parsed.commonErrors.map(String) : [],
      },
      balanced,
      schemeMarks: sum,
      questionMarks: Number(q.marks),
      needsFigure: !!parsed.needsFigure,
      confidence: parsed.confidence || 'low',
    }
  } catch (e) {
    return { ok: false, reason: e.message }
  }
}

module.exports = { isEnabled, status, markAnswer, markSubmission, generateMarkScheme, logStartupState, CONFIG }
