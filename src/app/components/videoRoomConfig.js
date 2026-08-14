/** @file WebRTC ICE configuration shared by every peer connection. */

/**
 * STUN servers used for WebRTC peer connections.
 * STUN only — there is no TURN relay, so peers behind symmetric NAT or a strict
 * corporate firewall will fail to connect. Add a TURN server here if calls start
 * failing for users on restricted networks.
 * @type {RTCConfiguration}
 */
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};
