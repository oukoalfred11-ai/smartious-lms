/**
 * classroom/rtc.js — the WebRTC mesh engine.
 *
 * One RTCPeerConnection per remote participant. Media flows browser to
 * browser; the socket only carries the negotiation messages. Implements
 * the "perfect negotiation" pattern (the W3C-recommended way to make
 * offer/answer glare impossible): for each pair, exactly one side is
 * "polite" — decided by comparing socket ids, so both sides agree
 * without coordination.
 *
 * The engine knows nothing about React or the UI. It emits:
 *   onTrack(socketId, MediaStream)   remote media arrived / changed
 *   onPeerClosed(socketId)           connection gone
 */
export class MeshEngine {
  constructor({ socket, localStream, iceServers, onTrack, onPeerClosed }) {
    this.socket = socket;
    this.localStream = localStream;
    this.iceServers = iceServers || [{ urls: 'stun:stun.l.google.com:19302' }];
    this.onTrack = onTrack || (() => {});
    this.onPeerClosed = onPeerClosed || (() => {});
    this.peers = new Map();   // socketId -> { pc, makingOffer, polite, stream }

    this._onSignal = (msg) => this._handleSignal(msg);
    socket.on('signal', this._onSignal);
  }

  /** Called for every participant already in the room, and on peer:joined. */
  connectTo(remoteId) {
    if (this.peers.has(remoteId)) return;

    // Lower socket id is the impolite (initiating) side — both peers
    // compute the same answer, so exactly one initiates.
    const polite = this.socket.id > remoteId;
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    const entry = { pc, polite, makingOffer: false, ignoreOffer: false, stream: null };
    this.peers.set(remoteId, entry);

    for (const track of this.localStream.getTracks())
      pc.addTrack(track, this.localStream);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) this.socket.emit('signal', { to: remoteId, candidate });
    };

    pc.ontrack = ({ streams }) => {
      entry.stream = streams[0];
      this.onTrack(remoteId, streams[0]);
    };

    pc.onnegotiationneeded = async () => {
      try {
        entry.makingOffer = true;
        await pc.setLocalDescription();
        this.socket.emit('signal', { to: remoteId, description: pc.localDescription });
      } catch (e) {
        console.error('[rtc] negotiation', e);
      } finally {
        entry.makingOffer = false;
      }
    };

    pc.onconnectionstatechange = () => {
      if (['failed', 'closed'].includes(pc.connectionState)) this.close(remoteId);
      // 'disconnected' often self-heals on mobile networks; give ICE 8s.
      if (pc.connectionState === 'disconnected') {
        setTimeout(() => {
          if (pc.connectionState === 'disconnected') {
            try { pc.restartIce(); } catch (e) { /* older browsers */ }
          }
        }, 8000);
      }
    };
  }

  async _handleSignal({ from, description, candidate }) {
    // A signal can arrive before peer:joined does — create lazily.
    if (!this.peers.has(from)) this.connectTo(from);
    const entry = this.peers.get(from);
    const { pc } = entry;
    try {
      if (description) {
        const offerCollision = description.type === 'offer' &&
          (entry.makingOffer || pc.signalingState !== 'stable');
        entry.ignoreOffer = !entry.polite && offerCollision;
        if (entry.ignoreOffer) return;
        if (offerCollision) {
          // Polite side rolls back its own offer and accepts theirs.
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' }),
            pc.setRemoteDescription(description),
          ]);
        } else {
          await pc.setRemoteDescription(description);
        }
        if (description.type === 'offer') {
          await pc.setLocalDescription();
          this.socket.emit('signal', { to: from, description: pc.localDescription });
        }
      } else if (candidate) {
        try { await pc.addIceCandidate(candidate); }
        catch (e) { if (!entry.ignoreOffer) throw e; }
      }
    } catch (e) {
      console.error('[rtc] signal handling', e);
    }
  }

  /**
   * Swap the outgoing video for every peer (camera <-> screen).
   * replaceTrack needs no renegotiation, so the switch is instant.
   * Also swaps the track inside localStream so self-preview tiles
   * bound to it update automatically.
   */
  async replaceVideoTrack(newTrack) {
    for (const { pc } of this.peers.values()) {
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) await sender.replaceTrack(newTrack).catch(e => console.error('[rtc] replaceTrack', e));
      else if (newTrack) pc.addTrack(newTrack, this.localStream);
    }
    const oldTrack = this.localStream.getVideoTracks()[0];
    if (oldTrack && oldTrack !== newTrack) this.localStream.removeTrack(oldTrack);
    if (newTrack && !this.localStream.getVideoTracks().includes(newTrack))
      this.localStream.addTrack(newTrack);
  }

  /** Toggle a local track kind on/off for every peer at once. */
  setTrackEnabled(kind, enabled) {
    for (const track of this.localStream.getTracks())
      if (track.kind === kind) track.enabled = enabled;
  }

  close(remoteId) {
    const entry = this.peers.get(remoteId);
    if (!entry) return;
    try { entry.pc.close(); } catch (e) { /* already closed */ }
    this.peers.delete(remoteId);
    this.onPeerClosed(remoteId);
  }

  destroy() {
    this.socket.off('signal', this._onSignal);
    for (const id of [...this.peers.keys()]) this.close(id);
    for (const track of this.localStream.getTracks()) track.stop();
  }
}
