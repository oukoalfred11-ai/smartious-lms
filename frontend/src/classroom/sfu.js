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
export class SfuEngine {
  constructor({ url, token, localStream, onTrack, onPeerClosed, resolveSocketId, publish = true, onCanPublishChanged }) {
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
  }

  async start() {
    const { Room, RoomEvent } = await import('livekit-client');
    this.room = new Room({ adaptiveStream: true, dynacast: true });

    this.room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      const id = participant.identity;
      const stream = this._streams.get(id) || new MediaStream();
      try { stream.addTrack(track.mediaStreamTrack); } catch (e) { /* dup */ }
      this._streams.set(id, stream);
      this._emit(id);
    });
    this.room.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
      const id = participant.identity;
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

    await this.room.connect(this.url, this.token);
    if (this.publish) await this.setPublishing(true);
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

  /** SFU manages per-subscriber quality server-side (dynacast/adaptive). */
  async applyVideoPolicy() { return { sfu: true }; }
  async getQuality() { return {}; }
  connectTo() { /* media comes from the SFU, not per-peer offers */ }
  close() { /* per-peer teardown handled by ParticipantDisconnected */ }
  reset() { try { this.room && this.room.disconnect(); } catch (e) { /* noop */ } this._streams.clear(); this._emittedKey.clear(); }
  destroy() { this.reset(); this.room = null; }
}
