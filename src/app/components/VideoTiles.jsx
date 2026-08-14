"use client";

/** @file The two video tile variants: the local preview and a remote peer's feed. */

import { useEffect, useRef } from "react";

/**
 * Local video tile with a name overlay.
 * The `<video>` is muted when it's your own feed — unmuted local playback would
 * loop your mic straight back into your speakers.
 * The ref is owned by `useVideoRoom`, which attaches the stream; this component
 * only renders the element.
 * @param {object} props - Component props.
 * @param {object} props.videoRef - Ref the hook binds the local stream to.
 * @param {string} props.userEmail - Label shown on the tile.
 * @param {boolean} props.isSelf - Mutes playback and switches the Local/Remote badge.
 * @param {boolean} props.streamReady - False shows a "Connecting" hint.
 * @returns {JSX.Element} The tile.
 */
export function VideoTile({ videoRef, userEmail, isSelf, streamReady }) {
  return (
    <div className="group relative min-h-64 overflow-hidden rounded-[4px] border border-rule bg-[#151311] shadow-sm">
      <video
        className="h-full min-h-64 w-full object-cover"
        ref={videoRef}
        autoPlay
        muted={isSelf}
        playsInline
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/80 to-transparent p-4">
        <div>
          <p className="max-w-[15rem] truncate text-sm font-semibold text-white">{userEmail}</p>
          <p className="text-xs text-white/70">{isSelf ? "You" : "Participant"} {!streamReady && "· Connecting"}</p>
        </div>
        <span className="rounded-[4px] border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
          {isSelf ? "Local" : "Remote"}
        </span>
      </div>
    </div>
  );
}

/**
 * Remote peer tile that binds that peer's MediaStream to a `<video>`.
 * Covers both arrival orders: the `stream` listener catches media that arrives
 * after mount, and the `streamsRef` lookup catches media that already arrived
 * before this tile rendered. Without the second path, a peer whose stream
 * landed during negotiation would show a permanently black tile.
 * The listener is removed on cleanup so effect re-runs don't stack duplicates.
 *
 * @param {object} props - Component props.
 * @param {object} props.peer - simple-peer instance for this participant.
 * @param {string} props.peerId - Ably connection id, used to look up the stream.
 * @param {string} props.userEmail - Label shown on the tile.
 * @param {{current: object}} props.streamsRef - Map of already-received streams by peer id.
 * @returns {JSX.Element} The tile.
 */
export function PeerVideoTile({ peer, peerId, userEmail, streamsRef }) {
  const ref = useRef();

  useEffect(() => {
    const applyStream = (remoteStream) => {
      if (ref.current) {
        ref.current.srcObject = remoteStream;
      }
    };

    peer.on("stream", applyStream);

    // Covers the case where the stream arrived before this tile mounted.
    if (streamsRef.current[peerId] && ref.current) {
      ref.current.srcObject = streamsRef.current[peerId];
    }

    // Without this, a re-run or StrictMode double-mount stacks another listener
    // on the same peer, and every renegotiated stream fires all of them.
    return () => {
      peer.removeListener?.("stream", applyStream);
    };
  }, [peer, peerId, streamsRef]);

  return (
    <div className="relative min-h-64 overflow-hidden rounded-[4px] border border-rule bg-[#151311] shadow-sm">
      <video
        className="h-full min-h-64 w-full object-cover"
        ref={ref}
        autoPlay
        playsInline
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4">
        <p className="max-w-[15rem] truncate text-sm font-semibold text-white">{userEmail}</p>
        <p className="text-xs text-white/70">Remote participant</p>
      </div>
    </div>
  );
}
