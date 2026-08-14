/**
 * @file WebRTC peer construction for the video room, split out of `useVideoRoom`.
 * Signalling rides the Ably `video:` channel: the initiator publishes
 * `signal-offer`, the receiver answers with `signal-answer`.
 */

import Peer from "simple-peer";
import { WEBRTC_CONFIG } from "./videoRoomConfig";

/**
 * Builds the peer helpers, closing over the hook's refs.
 * Takes refs rather than values because these run inside long-lived Ably
 * callbacks that would otherwise capture a stale render's state.
 * @param {object} deps - Refs and identity from `useVideoRoom`.
 * @param {{current: object}} deps.channelRef - Ably channel used for signalling.
 * @param {{current: string}} deps.connectionIdRef - This client's Ably connection id.
 * @param {{current: object}} deps.streamsRef - Mutable map of remote streams by connection id.
 * @param {string} deps.userEmail - Attached to signals so peers can label tiles.
 * @returns {{shouldInitiatePeer: Function, createPeer: Function, addPeer: Function}} Peer helpers.
 */
export function createPeerHelpers({ channelRef, connectionIdRef, streamsRef, userEmail }) {
  /**
   * Decides which side of a pair dials the other.
   * Both peers see each other enter presence, so without a rule both would
   * offer and create duplicate connections. Comparing connection ids gives both
   * sides the same answer with no extra negotiation — lower id initiates.
   * @param {string} remoteConnectionId - The other peer's Ably connection id.
   * @returns {boolean} `true` when this client should send the offer.
   */
  function shouldInitiatePeer(remoteConnectionId) {
    const selfId = connectionIdRef.current;

    if (!selfId || !remoteConnectionId) {
      return false;
    }

    return selfId < remoteConnectionId;
  }

  /**
   * Creates the initiating side of a peer connection and publishes its offer.
   * `trickle: false` means one consolidated offer instead of a stream of ICE
   * candidates — slower to connect, but it keeps signalling to a single message
   * per peer, which suits Ably pub/sub better than a candidate firehose.
   * @param {string} userToSignal - Connection id of the peer being dialled.
   * @param {MediaStream} stream - Local stream to send.
   * @returns {import("simple-peer").Instance} The peer; remote media lands in `streamsRef`.
   */
  function createPeer(userToSignal, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: WEBRTC_CONFIG,
    });

    peer.on("signal", signal => {
      channelRef.current?.publish("signal-offer", {
        to: userToSignal,
        from: connectionIdRef.current,
        userEmail,
        signal,
      });
    });

    peer.on("stream", remoteStream => {
      streamsRef.current[userToSignal] = remoteStream;
    });

    return peer;
  }

  /**
   * Creates the answering side of a peer connection for an incoming offer.
   * The offer is applied only after the `signal` handler is attached, so the
   * generated answer can't fire before anything is listening for it.
   * @param {object} incomingSignal - Offer payload from the `signal-offer` event.
   * @param {string} callerId - Connection id of the peer that dialled us.
   * @param {MediaStream} stream - Local stream to send back.
   * @returns {import("simple-peer").Instance} The peer; remote media lands in `streamsRef`.
   */
  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: WEBRTC_CONFIG,
    });

    peer.on("signal", signal => {
      channelRef.current?.publish("signal-answer", {
        to: callerId,
        from: connectionIdRef.current,
        userEmail,
        signal,
      });
    });

    peer.on("stream", remoteStream => {
      streamsRef.current[callerId] = remoteStream;
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return { shouldInitiatePeer, createPeer, addPeer };
}
