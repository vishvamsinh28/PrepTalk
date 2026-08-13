"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import Peer from "simple-peer";
import { useRouter } from "next/navigation";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

const WEBRTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};
const MEDIA_PREF_KEY = "preptalk-media-preferences";

function getStoredMediaPreferences() {
  if (typeof window === "undefined") {
    return { audioEnabled: true, videoEnabled: true };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(MEDIA_PREF_KEY) || "{}");
    return {
      audioEnabled: parsed.audioEnabled ?? true,
      videoEnabled: parsed.videoEnabled ?? true,
    };
  } catch {
    return { audioEnabled: true, videoEnabled: true };
  }
}

function storeMediaPreferences(nextPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEDIA_PREF_KEY, JSON.stringify(nextPreferences));
}

function syncLocalVideoElement(videoElement, mediaStream) {
  if (videoElement) {
    videoElement.srcObject = mediaStream;
  }
}

function createEmptyMediaStream() {
  if (typeof MediaStream === "undefined") {
    return null;
  }

  return new MediaStream();
}

function requestUserMedia(constraints) {
  if (typeof navigator === "undefined") {
    return Promise.reject(new Error("Camera is not available in this browser."));
  }

  if (navigator.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  const legacyGetUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  if (!legacyGetUserMedia) {
    return Promise.reject(
      new Error("Camera access requires a supported browser and HTTPS connection.")
    );
  }

  return new Promise((resolve, reject) => {
    legacyGetUserMedia.call(navigator, constraints, resolve, reject);
  });
}

export default function VideoRoom({ sessionId, userEmail }) {
  const router = useRouter();
  const initialMediaPreferences = getStoredMediaPreferences();
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(initialMediaPreferences.audioEnabled);
  const [videoEnabled, setVideoEnabled] = useState(initialMediaPreferences.videoEnabled);
  const [participants, setParticipants] = useState([{ socketId: "self", userEmail }]);

  const userVideo = useRef();
  const peersRef = useRef([]);
  const streamsRef = useRef({});
  const ablyRef = useRef(null);
  const channelRef = useRef(null);
  const connectionIdRef = useRef("");
  const streamRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let didSetupRealtime = false;
    const ably = new Ably.Realtime({ authUrl: `/api/ably/token?sessionId=${encodeURIComponent(sessionId)}` });
    const channel = ably.channels.get(`video:${sessionId}`);
    ablyRef.current = ably;
    channelRef.current = channel;

    const removePeer = (connectionId) => {
      const peerObj = peersRef.current.find(p => p.peerId === connectionId);
      if (peerObj) {
        peerObj.peer.destroy();
      }
      peersRef.current = peersRef.current.filter(p => p.peerId !== connectionId);
      setPeers(peers => peers.filter(p => p.peerId !== connectionId));
      setParticipants(p => p.filter(user => user.socketId !== connectionId));
      delete streamsRef.current[connectionId];
    };

    const syncPresence = async () => {
      const members = await channel.presence.get();
      const selfId = connectionIdRef.current;
      const remoteMembers = members.filter((member) => member.connectionId !== selfId);

      setParticipants([
        { socketId: "self", userEmail },
        ...remoteMembers.map((member) => ({
          socketId: member.connectionId,
          userEmail: member.data?.userEmail || "Interviewee",
        })),
      ]);

      remoteMembers.forEach((member) => {
        if (
          streamRef.current &&
          shouldInitiatePeer(member.connectionId) &&
          !peersRef.current.find((p) => p.peerId === member.connectionId)
        ) {
          const peer = createPeer(member.connectionId, streamRef.current);
          const peerData = { peerId: member.connectionId, peer, userEmail: member.data?.userEmail };
          peersRef.current.push(peerData);
          setPeers(existing => [...existing, peerData]);
        }
      });
    };

    const handleSignal = (event) => {
      const data = event.data;
      const selfId = connectionIdRef.current;
      if (!selfId || data.to !== selfId || data.from === selfId || !streamRef.current) return;

      if (event.name === "signal-offer") {
        if (peersRef.current.find(p => p.peerId === data.from)) return;

        const peer = addPeer(data.signal, data.from, streamRef.current);
        const peerData = { peerId: data.from, peer, userEmail: data.userEmail };
        peersRef.current.push(peerData);
        setPeers(existing => [...existing, peerData]);
        setParticipants(p => (
          p.some((user) => user.socketId === data.from)
            ? p
            : [...p, { socketId: data.from, userEmail: data.userEmail || "Interviewee" }]
        ));
      }

      if (event.name === "signal-answer") {
        const item = peersRef.current.find(p => p.peerId === data.from);
        if (item) item.peer.signal(data.signal);
      }
    };

    const waitForConnection = () => {
      if (ably.connection.state === "connected") {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        ably.connection.once("connected", resolve);
        ably.connection.once("failed", reject);
      });
    };

    const setupRealtime = async () => {
      if (didSetupRealtime) return;
      didSetupRealtime = true;

      await waitForConnection();
      if (!isMounted) return;

      connectionIdRef.current = ably.connection.id;
      await channel.attach();
      await channel.subscribe("signal-offer", handleSignal);
      await channel.subscribe("signal-answer", handleSignal);
      await channel.presence.subscribe("enter", syncPresence);
      await channel.presence.subscribe("leave", (event) => removePeer(event.connectionId));
      await channel.presence.enter({ userEmail });
      await syncPresence();
    };

    const initialMediaRequest = { video: videoEnabled, audio: audioEnabled };
    const initialStreamPromise = videoEnabled || audioEnabled
      ? requestUserMedia(initialMediaRequest)
      : Promise.resolve(createEmptyMediaStream());

    initialStreamPromise
      .then(currentStream => {
        if (!currentStream) {
          throw new Error("Unable to create a local media stream.");
        }

        if (!isMounted) {
          currentStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = currentStream;
        setStream(currentStream);
        syncLocalVideoElement(userVideo.current, currentStream);

        setupRealtime().catch((error) => console.error("Unable to start video signaling:", error));
      })
      .catch((error) => {
        console.error("Unable to start video stream:", error);
        if (isMounted) {
          setMediaError(error.message || "Unable to access camera and microphone.");
        }
      });

    return () => {
      isMounted = false;
      channel.unsubscribe("signal-offer", handleSignal);
      channel.unsubscribe("signal-answer", handleSignal);
      channel.presence.unsubscribe();
      channel.presence.leave().catch(() => {});
      peersRef.current.forEach(({ peer }) => peer.destroy());
      peersRef.current = [];
      streamRef.current?.getTracks().forEach(track => track.stop());
      ably.close();
    };
  }, [sessionId, userEmail]);

  function shouldInitiatePeer(remoteConnectionId) {
    const selfId = connectionIdRef.current;

    if (!selfId || !remoteConnectionId) {
      return false;
    }

    return selfId < remoteConnectionId;
  }

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

  const toggleAudio = () => {
    if (stream) {
      const nextAudioEnabled = !audioEnabled;

      if (!nextAudioEnabled) {
        const currentAudioTracks = stream.getAudioTracks();
        currentAudioTracks.forEach((track) => {
          peersRef.current.forEach(({ peer }) => {
            try {
              peer.removeTrack(track, stream);
            } catch {
              // Some peer states cannot renegotiate a removed track; stopping still releases hardware.
            }
          });
          track.stop();
          stream.removeTrack(track);
        });
        setAudioEnabled(false);
        storeMediaPreferences({ audioEnabled: false, videoEnabled });
        return;
      }

      requestUserMedia({ video: false, audio: true })
        .then((audioStream) => {
          const [audioTrack] = audioStream.getAudioTracks();
          if (!audioTrack) return;

          stream.addTrack(audioTrack);
          peersRef.current.forEach(({ peer }) => {
            try {
              peer.addTrack(audioTrack, stream);
            } catch {
              // If renegotiation is unavailable for a peer, new joins will still receive the track.
            }
          });
          setAudioEnabled(true);
          setMediaError("");
          storeMediaPreferences({ audioEnabled: true, videoEnabled });
        })
        .catch((error) => {
          console.error("Unable to restart audio stream:", error);
          setMediaError(error.message || "Unable to access microphone.");
        });
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const nextVideoEnabled = !videoEnabled;

      if (!nextVideoEnabled) {
        const currentVideoTracks = stream.getVideoTracks();
        currentVideoTracks.forEach((track) => {
          peersRef.current.forEach(({ peer }) => {
            try {
              peer.removeTrack(track, stream);
            } catch {
              // Some peer states cannot renegotiate a removed track; stopping still releases hardware.
            }
          });
          track.stop();
          stream.removeTrack(track);
        });
        syncLocalVideoElement(userVideo.current, stream);
        setVideoEnabled(false);
        storeMediaPreferences({ audioEnabled, videoEnabled: false });
        return;
      }

      requestUserMedia({ video: true, audio: false })
        .then((videoStream) => {
          const [videoTrack] = videoStream.getVideoTracks();
          if (!videoTrack) return;

          stream.addTrack(videoTrack);
          peersRef.current.forEach(({ peer }) => {
            try {
              peer.addTrack(videoTrack, stream);
            } catch {
              // If renegotiation is unavailable for a peer, new joins will still receive the track.
            }
          });
          syncLocalVideoElement(userVideo.current, stream);
          setVideoEnabled(true);
          setMediaError("");
          storeMediaPreferences({ audioEnabled, videoEnabled: true });
        })
        .catch((error) => {
          console.error("Unable to restart video stream:", error);
          setMediaError(error.message || "Unable to access camera.");
        });
    }
  };

  const leaveRoom = () => {
    channelRef.current?.presence.leave().catch(() => {});
    ablyRef.current?.close();
    streamRef.current?.getTracks().forEach(track => track.stop());
    router.push("/dashboard");
  };

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

function VideoTile({ videoRef, userEmail, isSelf, streamReady }) {
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

function PeerVideoTile({ peer, peerId, userEmail, streamsRef }) {
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
