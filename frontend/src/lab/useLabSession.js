/**
 * useLabSession — one student's experiment session in the browser.
 *
 *  • Actions run locally through the shared engine for an instant response,
 *    and are queued for the server.
 *  • Autosave sends only the new actions plus the notebook, answers and
 *    the student's analysis (results table, graphs, working),
 *    with the revision last confirmed. "Saved" is shown only after the
 *    server confirms; failures keep the work queued and retry with backoff.
 *  • Unsaved work is mirrored to localStorage so a refresh or a crash cannot
 *    lose it; on load, a newer local copy is offered back.
 *  • A 409 conflict (another tab saved first) never overwrites: the user is
 *    told and offered a reload.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../context/ctx.jsx'
import { paramsFor, applyAction, replay, viewOf, getExperiment, emptyAnalysis } from './core.js'

const AUTOSAVE_MS = 2500
const backupKey = (id) => 'sm_lab_backup_' + id
const submitKeyFor = (id) => {
  const k = 'sm_lab_submitkey_' + id
  let v = null
  try { v = localStorage.getItem(k) } catch {}
  if (!v) { v = (crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2)); try { localStorage.setItem(k, v) } catch {} }
  return v
}

export default function useLabSession({ experimentId, assignmentId = null, sessionId = null, readOnly = false }) {
  const [session, setSession] = useState(null)       // server copy (metadata)
  const def = useMemo(() => getExperiment(experimentId || session?.experimentId), [experimentId, session?.experimentId])
  const [state, setState] = useState(null)
  const [actions, setActions] = useState([])         // full local log
  const [notebook, setNotebook] = useState({})
  const [answers, setAnswers] = useState({})
  const [analysis, setAnalysis] = useState(null)
  const [save, setSave] = useState({ status: 'idle', at: null, error: null })   // idle|dirty|saving|saved|error|conflict
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [restorable, setRestorable] = useState(null)

  const ref = useRef({ savedCount: 0, revision: 0, dirtyMeta: false, saving: false, retry: 0, inflight: 0, metaV: 0, savedMetaV: 0 })
  const params = useMemo(() => (def && session ? paramsFor(def, session.seed, session.options) : null), [def, session?.seed, session?.options])
  const view = useMemo(() => (def && params && state ? viewOf(def, params, state) : null), [def, params, state])
  const editable = !readOnly && session && ['in_progress', 'returned'].includes(session.status)

  // ── Load or create ───────────────────────────────────────
  useEffect(() => {
    let alive = true
    setLoadError(null)
    const go = async () => {
      const res = sessionId
        ? await api.get('/lab/sessions/' + sessionId)
        : await api.post('/lab/sessions', { experimentId, assignmentId })
      const s = res.data?.data?.session
      if (!alive || !s) return
      const d = getExperiment(s.experimentId)
      const p = paramsFor(d, s.seed, s.options)
      setSession(s)
      setActions(s.actions || [])
      setNotebook(s.notebook || {})
      setAnswers(s.answers || {})
      setAnalysis(s.analysis || emptyAnalysis())
      setState(replay(d, p, s.actions || []))
      ref.current = { savedCount: (s.actions || []).length, revision: s.revision, dirtyMeta: false, saving: false, retry: 0, inflight: 0, metaV: 0, savedMetaV: 0 }
      setSave({ status: 'saved', at: s.updatedAt, error: null })
      // A local copy newer than the server's (e.g. the network dropped before saving)?
      try {
        const b = JSON.parse(localStorage.getItem(backupKey(s._id)) || 'null')
        if (b && b.baseRevision === s.revision && (b.actions?.length > (s.actions || []).length || JSON.stringify(b.notebook) !== JSON.stringify(s.notebook || {}) || JSON.stringify(b.answers) !== JSON.stringify(s.answers || {}) || (b.analysis && JSON.stringify(b.analysis) !== JSON.stringify(s.analysis || emptyAnalysis()))))
          setRestorable(b)
      } catch {}
    }
    go().catch(e => alive && setLoadError(e?.response?.data?.message || 'Could not open this experiment. Check your connection and try again.'))
    return () => { alive = false }
  }, [experimentId, assignmentId, sessionId])

  // ── Local backup of anything not yet confirmed ───────────
  useEffect(() => {
    if (!session || !editable) return
    const dirty = actions.length > ref.current.savedCount || ref.current.dirtyMeta
    if (!dirty) { try { localStorage.removeItem(backupKey(session._id)) } catch {} return }
    try { localStorage.setItem(backupKey(session._id), JSON.stringify({ baseRevision: ref.current.revision, actions, notebook, answers, analysis, at: Date.now() })) } catch {}
  }, [actions, notebook, answers, analysis, session, editable])

  // ── Save ─────────────────────────────────────────────────
  const saveNow = useCallback(async () => {
    const r = ref.current
    if (!session || !editable || r.saving) return false
    const pending = actions.slice(r.savedCount)
    if (!pending.length && !r.dirtyMeta) return true
    r.saving = true
    r.inflight = pending.length
    const metaV = r.metaV
    setSave(s => ({ ...s, status: 'saving' }))
    try {
      const { data } = await api.put('/lab/sessions/' + session._id, {
        baseRevision: r.revision, fromIndex: r.savedCount, newActions: pending, notebook, answers, analysis,
      })
      r.revision = data.data.revision
      r.savedCount += pending.length
      r.savedMetaV = metaV
      r.dirtyMeta = r.metaV !== metaV   // edits typed during the save are still pending
      r.retry = 0
      setSave({ status: actions.length > r.savedCount ? 'dirty' : 'saved', at: data.data.savedAt, error: null })
      return true
    } catch (e) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message
      if (status === 409) setSave({ status: 'conflict', at: null, error: msg || 'Saved elsewhere. Reload to continue.' })
      else if (status === 422) setSave({ status: 'error', at: null, error: msg || 'The server refused an action.' })
      else { r.retry += 1; setSave({ status: 'error', at: null, error: status ? (msg || 'Could not save.') : 'You are offline. Your work is kept on this device and will be saved when you reconnect.' }) }
      return false
    } finally { r.saving = false; r.inflight = 0 }
  }, [session, editable, actions, notebook, answers, analysis])

  useEffect(() => {
    if (!session || !editable) return
    const dirty = actions.length > ref.current.savedCount || ref.current.dirtyMeta
    if (!dirty || save.status === 'conflict') return
    const delay = save.status === 'error' ? Math.min(30000, AUTOSAVE_MS * 2 ** ref.current.retry) : AUTOSAVE_MS
    const t = setTimeout(saveNow, delay)
    return () => clearTimeout(t)
  }, [actions, notebook, answers, analysis, session, editable, save.status, saveNow])

  // Warn before leaving with unsaved work; save when the tab is hidden.
  useEffect(() => {
    const unsaved = () => actions.length > ref.current.savedCount || ref.current.dirtyMeta
    const before = (e) => { if (editable && unsaved()) { e.preventDefault(); e.returnValue = '' } }
    const vis = () => { if (document.visibilityState === 'hidden' && editable && unsaved()) saveNow() }
    window.addEventListener('beforeunload', before)
    document.addEventListener('visibilitychange', vis)
    const online = () => { if (editable && unsaved()) saveNow() }
    window.addEventListener('online', online)
    return () => { window.removeEventListener('beforeunload', before); document.removeEventListener('visibilitychange', vis); window.removeEventListener('online', online) }
  }, [actions, editable, saveNow])

  // ── Actions ──────────────────────────────────────────────
  // Several actions can be dispatched before React re-renders (an instrument
  // with two readings, a held burette tap): each must build on the last one,
  // as the server's replay of the log does, not on the state of the last render.
  const stateRef = useRef(state)
  stateRef.current = state
  const dispatch = useCallback((type, payload = {}) => {
    if (!editable || !def || !params) return false
    try {
      const next = applyAction(def, params, stateRef.current, { type, payload })
      stateRef.current = next
      setState(next)
      setActions(a => [...a, { type, payload }])
      setActionError(null)
      setSave(s => (s.status === 'saved' || s.status === 'idle' ? { ...s, status: 'dirty' } : s))
      return true
    } catch (e) {
      setActionError(e.message)
      return false
    }
  }, [editable, def, params, state])

  /** Undo the last action that has not been saved yet (saved actions are part of the record). */
  const undo = useCallback(() => {
    if (!editable || actions.length <= ref.current.savedCount + ref.current.inflight) return false
    const a = actions.slice(0, -1)
    setActions(a)
    setState(replay(def, params, a))
    return true
  }, [editable, actions, def, params])
  const canUndo = editable && actions.length > ref.current.savedCount + ref.current.inflight

  const updateNotebook = useCallback((k, v) => { ref.current.dirtyMeta = true; ref.current.metaV += 1; setNotebook(n => ({ ...n, [k]: v })); setSave(s => ({ ...s, status: 'dirty' })) }, [])
  /** Replace the analysis (table, graphs, working) with an updater function or a value. */
  const updateAnalysis = useCallback((fn) => { ref.current.dirtyMeta = true; ref.current.metaV += 1; setAnalysis(a => (typeof fn === 'function' ? fn(a || emptyAnalysis()) : fn)); setSave(s => ({ ...s, status: 'dirty' })) }, [])
  const updateAnswer = useCallback((k, v) => { ref.current.dirtyMeta = true; ref.current.metaV += 1; setAnswers(n => ({ ...n, [k]: v })); setSave(s => ({ ...s, status: 'dirty' })) }, [])

  const restoreBackup = useCallback(() => {
    if (!restorable) return
    try {
      const st = replay(def, params, restorable.actions)
      setActions(restorable.actions); setState(st)
      setNotebook(restorable.notebook || {}); setAnswers(restorable.answers || {}); if (restorable.analysis) setAnalysis(restorable.analysis)
      ref.current.dirtyMeta = true
      setSave(s => ({ ...s, status: 'dirty' }))
    } catch (e) { setActionError('The saved copy on this device could not be restored: ' + e.message) }
    setRestorable(null)
  }, [restorable, def, params])
  const discardBackup = useCallback(() => { try { localStorage.removeItem(backupKey(session._id)) } catch {} setRestorable(null) }, [session])

  const reset = useCallback(async () => {
    if (!editable) return
    const ok = await saveNow()
    if (!ok) return
    const { data } = await api.post('/lab/sessions/' + session._id + '/reset', { baseRevision: ref.current.revision })
    const s = data.data.session
    setSession(s); setActions([]); setAnswers({}); setState(def.initialState(params))
    ref.current = { ...ref.current, savedCount: 0, revision: s.revision, dirtyMeta: false }
    setSave({ status: 'saved', at: s.updatedAt, error: null })
  }, [editable, saveNow, session, def, params])

  const submit = useCallback(async () => {
    const ok = await saveNow()
    if (!ok) throw new Error('Your latest changes could not be saved, so the work was not submitted. Check your connection and try again.')
    const { data } = await api.post('/lab/sessions/' + session._id + '/submit', { baseRevision: ref.current.revision, submissionKey: submitKeyFor(session._id) })
    const s = data.data.session
    setSession(s)
    ref.current.revision = s.revision
    try { localStorage.removeItem(backupKey(session._id)) } catch {}
    return s
  }, [saveNow, session])

  return {
    def, session, params, state, view, notebook, answers, analysis: analysis || emptyAnalysis(), editable,
    // Nothing but bench set-up so far (or nothing at all): the 3D set-up quest may run.
    onlySetup: actions.every(a => a.type === 'setUp'),
    save, saveNow, loadError, actionError, clearActionError: () => setActionError(null),
    dispatch, undo, canUndo, updateNotebook, updateAnswer, updateAnalysis, reset, submit,
    restorable, restoreBackup, discardBackup,
  }
}
