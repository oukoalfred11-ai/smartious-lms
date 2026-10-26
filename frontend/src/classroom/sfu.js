/**
 * sfu.js — SFU media engine on LiveKit, drop-in behind MeshEngine's surface.
 *
 * Mesh uploads every camera once per peer, capping rooms at ~6 cameras on
 * ordinary connections. Here each participant uploads ONCE and the LiveKit
 * server forwards, so 20+ cameras (clubs, whole-school events) become
 * routine. Signaling, roster, chat and whiteboard stay on socket.io
 * untouched: this class only moves the MEDIA.
 *
 * Identity: LiveKit tokens carry the userId; the classroom keys streams by
 * socketId, so a resolver maps userId -> socketId from the live roster.
 * If a track arrives before the roster entry, refreshMappings() re-emits
 * once the roster catches up (the classroom calls it on roster changes).
 *
 * Only used when the backend reports engine 'sfu' (LIVEKIT_* env set);
 * otherwise the classroom builds MeshEngine exactly as before.
 */
// Students and parents are the learners' side of the room; everyone else
// (teacher, staff observers) is staff. Same rule as the classroom tiles.
export const isLearnerRole = (role) => role === 'student' || role === 'parent';

export class SfuEngine {
  constructor({ url, token, localStream, onTrack, onPeerClosed, resolveSocketId, publish = true, onCanPublishChanged, getToken, onMediaState, onAudioBlocked }) {
    this.url = url;
    this.token = token;
    this.localStream = localStream;
    this.onTrack = onTrack || (() => {});
    this.onPeerClosed = onPeerClosed || (() => {});
    this.resolveSocketId = resolveSocketId || ((id) => id);
    this.publish = publish !== false;
    this.onCanPublishChanged = onCanPublishChanged || (() => {});
    this.room = null;
    this.camPub = null;
    this.micPub = null;
    this._streams = new Map(); // identity -> MediaStream
    this._emittedKey = new Map(); // identity -> socketId the stream was emitted under
    // ── Resilience ──
    // getToken mints a FRESH LiveKit token for a full rejoin (the one we
    // joined with expires); onMediaState reports 'reconnecting'/'connected'
    // so the classroom can show its banner; onAudioBlocked reports the
    // browser refusing to play audio until a tap (autoplay policy) — the
    // classic "students cannot hear the teacher" failure.
    this.getToken = getToken || null;
    this.onMediaState = onMediaState || (() => {});
    this.onAudioBlocked = onAudioBlocked || (() => {});
    this._quality = new Map(); // identity ('__local' for self) -> good|fair|poor|down
    this._closed = false;
    this._rejoining = false;
    // Data saver (applyVideoPolicy): which remote identities are staff
    // (their video is kept), and whether the saver is on.
    this._saver = false;
    this._staff = new Set();
    this._camSaver = null;
    this._camTrack = null;
    this._lk = null;
    // Remote audio is played by LiveKit itself (track.attach() into hidden
    // <audio> elements kept here), not by the classroom's audio rail: only
    // then does LiveKit see the elements, detect a browser autoplay block
    // (onAudioBlocked) and unlock them all with startAudio() on one tap.
    // A shared MediaStream that gained its audio track after play() also
    // stayed silent on some browsers (Safari); attach() gives every track
    // its own element.
    this.handlesAudio = true;
    this._audioBox = null;
    this._audioEls = new Map(); // track sid -> { track, el }
  }

  _attachAudio(track) {
    try {
      if (typeof document === 'undefined') return;
      if (!this._audioBox) {
        this._audioBox = document.createElement('div');
        this._audioBox.style.display = 'none';
        this._audioBox.setAttribute('data-classroom-audio', '');
        document.body.appendChild(this._audioBox);
      }
      const key = track.sid || track.mediaStreamTrack?.id;
      if (this._audioEls.has(key)) return;
      const el = track.attach();
      el.autoplay = true;
      el.setAttribute('playsinline', '');
      this._audioBox.appendChild(el);
      this._audioEls.set(key, { track, el });
      const p = el.play && el.play();
      if (p && p.catch) p.catch(() => this.onAudioBlocked(true));
    } catch (e) { console.error('[sfu] audio attach:', e.message); }
  }

  _detachAudio(track) {
    const key = track.sid || track.mediaStreamTrack?.id;
    const rec = this._audioEls.get(key);
    if (!rec) return;
    try { rec.track.detach(rec.el); } catch (e) { /* noop */ }
    try { rec.el.remove(); } catch (e) { /* noop */ }
    this._audioEls.delete(key);
  }

  _detachAllAudio() {
    for (const { track } of [...this._audioEls.values()]) this._detachAudio(track);
  }

  /** Nudge every remote audio element that the browser paused (tab
   *  switch, fullscreen, device change). Cheap; called on a timer. */
  _resumeAudio() {
    for (const { el } of this._audioEls.values()) {
      if (el.paused) { const p = el.play && el.play(); if (p && p.catch) p.catch(() => this.onAudioBlocked(true)); }
    }
  }

  async start() {
    this._lk = await import('livekit-client');
    const { Room, RoomEvent } = this._lk;
    this.room = new Room({ adaptiveStream: true, dynacast: true });

    // New cameras arriving while the data saver is on follow it too.
    this.room.on(RoomEvent.TrackPublished, (_pub, participant) => this._applyRemote(participant));

    this.room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      const id = participant.identity;
      const stream = this._streams.get(id) || new MediaStream();
      try { stream.addTrack(track.mediaStreamTrack); } catch (e) { /* dup */ }
      this._streams.set(id, stream);
      this._emit(id);
      if (track.kind === 'audio') this._attachAudio(track);
      if (track.kind === 'video') this._applyRemote(participant);
    });
    this.room.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
      const id = participant.identity;
      if (track.kind === 'audio') this._detachAudio(track);
      const stream = this._streams.get(id);
      if (stream) { try { stream.removeTrack(track.mediaStreamTrack); } catch (e) { /* noop */ } this._emit(id); }
    });
    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      const id = participant.identity;
      const key = this._emittedKey.get(id);
      this._streams.delete(id);
      this._emittedKey.delete(id);
      if (key) this.onPeerClosed(key);
    });

    // Assemblies: the stage publishes, the audience only watches. When
    // staff invite a viewer to speak, LiveKit flips their permissions and
    // this event fires on their client; the classroom then publishes.
    this.room.on(RoomEvent.ParticipantPermissionsChanged, (_prev, participant) => {
      if (participant === this.room.localParticipant) {
        this.onCanPublishChanged(!!participant.permissions?.canPublish);
      }
    });

    // ── Who has slow internet ──
    // LiveKit scores every participant's link (excellent/good/poor/lost)
    // and tells every client, so each tile can carry an honest indicator
    // and the classroom can NAME who is struggling.
    this.room.on(RoomEvent.ConnectionQualityChanged, (q, participant) => {
      const mapped = { excellent: 'good', good: 'fair', poor: 'poor', lost: 'down' }[q];
      const key = participant === this.room.localParticipant ? '__local' : participant.identity;
      if (mapped) this._quality.set(key, mapped); else this._quality.delete(key);
    });

    // ── Media auto-reconnect ──
    // LiveKit retries transparently on short blips (Reconnecting →
    // Reconnected). If it gives up entirely (Disconnected), we rebuild the
    // whole media session ourselves with a fresh token and keep retrying —
    // slow internet must mean a wait, never a dead, silent classroom.
    this.room.on(RoomEvent.Reconnecting, () => this.onMediaState('reconnecting'));
    this.room.on(RoomEvent.Reconnected, () => this.onMediaState('connected'));
    this.room.on(RoomEvent.Disconnected, () => {
      if (this._closed) return;
      this.onMediaState('reconnecting');
      this._rejoin();
    });

    // ── Audio unlock ──
    // Browsers refuse to PLAY audio until the person has interacted with
    // the page. When that happens, tracks flow but the room is silent —
    // the classroom shows a tap-to-enable button wired to startAudio().
    this.room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      this.onAudioBlocked(!this.room.canPlaybackAudio);
    });

    await this.room.connect(this.url, this.token);
    if (this.publish) await this.setPublishing(true);
    this.onMediaState('connected');
    if (!this.room.canPlaybackAudio) this.onAudioBlocked(true);
    this._resumeTimer = setInterval(() => this._resumeAudio(), 3000);
    if (typeof document !== 'undefined') {
      this._onVisible = () => this._resumeAudio();
      document.addEventListener('visibilitychange', this._onVisible);
    }
  }

  /** The person tapped the enable-audio button. */
  async startAudio() {
    try {
      await this.room.startAudio();
      for (const { el } of this._audioEls.values()) { try { await el.play(); } catch (e) { /* still blocked */ } }
      this.onAudioBlocked(!this.room.canPlaybackAudio || [...this._audioEls.values()].some(r => r.el.paused));
    }
    catch (e) { console.error('[sfu] startAudio:', e.message); }
  }

  /** Full media rejoin with a fresh token and capped backoff. Runs until
   *  it succeeds or the engine is destroyed; each failure waits a little
   *  longer (2s up to 10s) so a flaky connection is retried gently. */
  async _rejoin() {
    if (this._rejoining || this._closed) return;
    this._rejoining = true;
    // Stale streams would freeze tiles; clear them so resubscription
    // repopulates cleanly when the room comes back.
    for (const [, key] of this._emittedKey) { try { this.onPeerClosed(key); } catch (e) { /* noop */ } }
    this._streams.clear(); this._emittedKey.clear();
    this._detachAllAudio();
    let attempt = 0;
    while (!this._closed) {
      attempt += 1;
      const wait = Math.min(2000 * attempt, 10000);
      await new Promise(r => setTimeout(r, wait));
      if (this._closed) break;
      try {
        if (this.getToken) {
          const fresh = await this.getToken();
          if (fresh) this.token = fresh;
        }
        this.camPub = null; this.micPub = null;
        await this.room.connect(this.url, this.token);
        if (this.publish) await this.setPublishing(true);
        this.onMediaState('connected');
        if (!this.room.canPlaybackAudio) this.onAudioBlocked(true);
        break;
      } catch (e) {
        console.error('[sfu] rejoin attempt ' + attempt + ':', e.message);
      }
    }
    this._rejoining = false;
  }

  /** Publish (or stop publishing) the local mic and camera. Used at join
   *  for normal classes, and on stage-invite for assembly viewers. */
  async setPublishing(on) {
    if (on) {
      for (const t of this.localStream ? this.localStream.getTracks() : []) {
        if ((t.kind === 'video' && this.camPub) || (t.kind === 'audio' && this.micPub)) continue;
        try {
          const pub = await this.room.localParticipant.publishTrack(t);
          if (t.kind === 'video') this.camPub = pub; else this.micPub = pub;
        } catch (e) { console.error('[sfu] publish:', e.message); }
      }
      this.publish = true;
    } else {
      for (const pub of [this.camPub, this.micPub]) {
        if (pub && pub.track) { try { await this.room.localParticipant.unpublishTrack(pub.track, false); } catch (e) { /* noop */ } }
      }
      this.camPub = null; this.micPub = null; this.publish = false;
    }
  }

  _emit(identity) {
    const stream = this._streams.get(identity);
    if (!stream) return;
    const key = this.resolveSocketId(identity) || identity;
    const prev = this._emittedKey.get(identity);
    if (prev && prev !== key) this.onPeerClosed(prev);
    this._emittedKey.set(identity, key);
    this.onTrack(key, stream);
  }

  /** Classroom calls this on every roster change so early-arriving tracks
   *  get re-keyed from userId to the proper socketId. */
  refreshMappings() { for (const id of this._streams.keys()) this._emit(id); }

  /** Screen share and camera restore both go through here, as in mesh. */
  async replaceVideoTrack(newTrack) {
    try {
      if (this.camPub && this.camPub.track) {
        await this.room.localParticipant.unpublishTrack(this.camPub.track, false);
        this.camPub = null;
      }
      if (newTrack) this.camPub = await this.room.localParticipant.publishTrack(newTrack);
    } catch (e) { console.error('[sfu] replaceVideoTrack:', e.message); }
  }

  setTrackEnabled(kind, enabled) {
    const pub = kind === 'audio' ? this.micPub : this.camPub;
    try { if (pub) { if (enabled) pub.unmute(); else pub.mute(); } } catch (e) { /* noop */ }
    const t = this.localStream && this.localStream.getTracks().find((x) => x.kind === kind);
    if (t) t.enabled = enabled;
  }

  /** Hot-add or swap the local microphone after joining (the Enable
   *  camera-and-mic flow). Publishes the fresh track to the room. */
  async addLocalAudioTrack(track) {
    if (!this.publish) return; // assembly audience: published on stage invite
    try {
      if (this.micPub && this.micPub.track) {
        await this.room.localParticipant.unpublishTrack(this.micPub.track, false);
        this.micPub = null;
      }
      this.micPub = await this.room.localParticipant.publishTrack(track);
    } catch (e) { console.error('[sfu] audio hot-add:', e.message); }
  }

  addExtraTrack(track) {
    const handle = { pub: null };
    this.room.localParticipant.publishTrack(track)
      .then((pub) => { handle.pub = pub; })
      .catch((e) => console.error('[sfu] extra track:', e.message));
    return [handle];
  }

  removeSenders(handles) {
    (handles || []).forEach((h) => {
      const track = h && h.pub && h.pub.track;
      if (track) this.room.localParticipant.unpublishTrack(track, true).catch(() => {});
    });
  }

  /**
   * Data saver. Without it the SFU already adapts per subscriber
   * (simulcast, dynacast, adaptive stream). With it, for a weak connection:
   *   upload   : the camera is captured at 320x240, 12fps, so every
   *              simulcast layer shrinks (a shared screen is left alone);
   *   download : other students' cameras are unsubscribed — they cost the
   *              most and matter least; staff video (the teacher's camera
   *              or shared screen) is kept, at the lowest layer.
   * Audio is never touched. peers = the roster ({ userId, role }).
   */
  async applyVideoPolicy({ dataSaver = false, sharing = false, peers = [] } = {}) {
    this._saver = !!dataSaver;
    this._staff = new Set(peers.filter((p) => !isLearnerRole(p.role)).map((p) => String(p.userId)));
    const cam = !sharing && this.localStream && this.localStream.getVideoTracks().find((t) => t.readyState === 'live');
    if (cam && cam.readyState === 'live' && (this._camSaver !== this._saver || this._camTrack !== cam)) {
      this._camSaver = this._saver;
      this._camTrack = cam;
      const c = this._saver
        ? { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 12, max: 15 } }
        : { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 20 } };
      try { await cam.applyConstraints(c); } catch (e) { /* camera keeps its size */ }
    }
    if (this.room) for (const p of this.room.remoteParticipants.values()) this._applyRemote(p);
    return { sfu: true, dataSaver: this._saver };
  }

  _applyRemote(participant) {
    if (!participant || !this._lk) return;
    const staff = this._staff.has(String(participant.identity).split('#')[0]);
    const want = !this._saver || staff;
    for (const pub of participant.videoTrackPublications.values()) {
      try { if (pub.isSubscribed !== want) pub.setSubscribed(want); } catch (e) { /* noop */ }
      if (want && staff && pub.isSubscribed) {
        try { pub.setVideoQuality(this._saver ? this._lk.VideoQuality.LOW : this._lk.VideoQuality.HIGH); } catch (e) { /* adaptive stream decides */ }
      }
    }
  }
  /** Same shape the mesh engine returns — socketId -> good|fair|poor|down —
   *  plus 'self' for the local link, fed by ConnectionQualityChanged. */
  async getQuality() {
    const out = {};
    for (const [id, q] of this._quality) {
      if (id === '__local') { out.self = q; continue; }
      const key = this.resolveSocketId(id) || id;
      if (key) out[key] = q;
    }
    return out;
  }
  connectTo() { /* media comes from the SFU, not per-peer offers */ }
  close() { /* per-peer teardown handled by ParticipantDisconnected */ }
  reset() { try { this.room && this.room.disconnect(); } catch (e) { /* noop */ } this._detachAllAudio(); this._streams.clear(); this._emittedKey.clear(); this._quality.clear(); }
  destroy() {
    this._closed = true;
    clearInterval(this._resumeTimer);
    if (this._onVisible && typeof document !== 'undefined') document.removeEventListener('visibilitychange', this._onVisible);
    this.reset();
    try { this._audioBox && this._audioBox.remove(); } catch (e) { /* noop */ }
    this._audioBox = null;
    this.room = null;
  }
}
