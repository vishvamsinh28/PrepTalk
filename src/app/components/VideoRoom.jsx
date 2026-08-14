"use client";

/** @file Video call UI. All state and signalling live in `useVideoRoom`. */

import { useVideoRoom } from "./useVideoRoom";
import { PeerVideoTile, VideoTile } from "./VideoTiles";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

/**
 * Video call UI: local tile, peer tiles, and the mic/camera/leave controls.
 * Purely presentational — every piece of state and all signalling lives in
 * `useVideoRoom`, so this file can be restyled without touching WebRTC.
 * Peer display names fall back through three sources (signal payload, then
 * presence, then a generic label) because a tile can render before presence
 * data for that peer has arrived.
 * @param {object} props - Component props.
 * @param {string} props.sessionId - Session whose room to join.
 * @param {string} props.userEmail - Local participant's email, shown on their tile.
 * @returns {JSX.Element} The room UI, with a banner when media access failed.
 */
export default function VideoRoom({ sessionId, userEmail }) {
  const {
    peers,
    stream,
    mediaError,
    audioEnabled,
    videoEnabled,
    participants,
    userVideo,
    streamsRef,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = useVideoRoom(sessionId, userEmail);

  return (
    <div className="space-y-5">
      {mediaError && (
        <div className="rounded-[4px] border border-amber-600/40 bg-amber-50 p-4 text-sm text-amber-700">
          {mediaError}
        </div>
      )}

      <div className="grid auto-rows-fr gap-4 lg:grid-cols-2">
        <VideoTile
          videoRef={userVideo}
          userEmail={userEmail}
          isSelf={true}
          streamReady={!!stream}
        />

        {/* Peers Videos */}
        {peers.map(({ peerId, peer, userEmail: peerEmail }) => (
          <PeerVideoTile
            key={peerId}
            peer={peer}
            peerId={peerId}
            userEmail={peerEmail || participants.find((participant) => participant.socketId === peerId)?.userEmail || "Interviewee"}
            streamsRef={streamsRef}
          />
        ))}
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-rule pt-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-ink">
            {participants.length} participant{participants.length === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 text-[13px] text-ink-soft">
            Controls affect your local stream only.
          </p>
        </div>

        {/* Muted / camera-off are the states worth flagging, so only those take the accent */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleAudio}
            aria-pressed={!audioEnabled}
            className={`inline-flex min-h-10 items-center gap-2 rounded-[4px] border px-4 text-sm transition-colors ${
              audioEnabled
                ? "border-rule bg-white text-ink hover:border-ink/30"
                : "border-accent bg-accent/5 text-accent"
            }`}
          >
            {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
            {audioEnabled ? "Mute" : "Unmute"}
          </button>
          <button
            onClick={toggleVideo}
            aria-pressed={!videoEnabled}
            className={`inline-flex min-h-10 items-center gap-2 rounded-[4px] border px-4 text-sm transition-colors ${
              videoEnabled
                ? "border-rule bg-white text-ink hover:border-ink/30"
                : "border-accent bg-accent/5 text-accent"
            }`}
          >
            {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
            {videoEnabled ? "Stop video" : "Start video"}
          </button>
          <button
            onClick={leaveRoom}
            className="ml-2 inline-flex min-h-10 items-center gap-2 rounded-[4px] bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            <FaPhoneSlash />
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
