"use client";

import { useEffect, useRef } from "react";

/**
 * Local video tile with name overlay.
 * @param {{ videoRef: object, userEmail: string, isSelf: boolean, streamReady: boolean }} props
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
 * Remote peer tile that binds the peer's MediaStream to a <video>.
 * @param {{ peer: object, peerId: string, userEmail: string, streamsRef: object }} props
 */
export function PeerVideoTile({ peer, peerId, userEmail, streamsRef }) {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", remoteStream => {
      if (ref.current) {
        ref.current.srcObject = remoteStream;
      }
    });

    if (streamsRef.current[peerId] && ref.current) {
      ref.current.srcObject = streamsRef.current[peerId];
    }
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
