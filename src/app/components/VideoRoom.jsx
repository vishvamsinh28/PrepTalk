"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import Peer from "simple-peer";
import { useRouter } from "next/navigation";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

export default function VideoRoom({ sessionId, userEmail }) {
  const router = useRouter();
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
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
    const ably = new Ably.Realtime({ authUrl: "/api/ably/token" });
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
        if (streamRef.current && !peersRef.current.find((p) => p.peerId === member.connectionId)) {
          const peer = createPeer(member.connectionId, streamRef.current);
          peersRef.current.push({ peerId: member.connectionId, peer, userEmail: member.data?.userEmail });
          setPeers(existing => [...existing, peer]);
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
        peersRef.current.push({ peerId: data.from, peer, userEmail: data.userEmail });
        setPeers(existing => [...existing, peer]);
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

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        if (!isMounted) {
          currentStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = currentStream;
        setStream(currentStream);
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }

        ably.connection.once("connected", async () => {
          connectionIdRef.current = ably.connection.id;
          await channel.attach();
          await channel.subscribe("signal-offer", handleSignal);
          await channel.subscribe("signal-answer", handleSignal);
          await channel.presence.subscribe("enter", syncPresence);
          await channel.presence.subscribe("leave", (event) => removePeer(event.connectionId));
          await channel.presence.enter({ userEmail });
          await syncPresence();
        });
      })
      .catch((error) => console.error("Unable to start video stream:", error));

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

  function createPeer(userToSignal, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
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
      stream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setAudioEnabled(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setVideoEnabled(prev => !prev);
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
      <div className="grid auto-rows-fr gap-4 lg:grid-cols-2">
        <VideoTile
          videoRef={userVideo}
          userEmail={userEmail}
          isSelf={true}
          streamReady={!!stream}
        />

        {/* Peers Videos */}
        {peers.map((peer, index) => (
          <PeerVideoTile
            key={index}
            peer={peer}
            peerId={peersRef.current[index]?.peerId}
            userEmail={participants[index + 1]?.userEmail || "Interviewee"}
            streamsRef={streamsRef}
          />
        ))}
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/35 p-3 sm:flex-row sm:items-center">
        <div className="px-2">
          <p className="text-sm font-bold text-white">{participants.length} participant{participants.length === 1 ? "" : "s"}</p>
          <p className="text-xs text-slate-400">Controls affect your local stream only.</p>
        </div>
        <div className="flex flex-wrap gap-3">
        <button
          onClick={toggleAudio}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-black transition ${
            audioEnabled
              ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15"
              : "border border-rose-300/25 bg-rose-400/15 text-rose-100 hover:bg-rose-400/20"
          }`}
        >
          {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          {audioEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button
          onClick={toggleVideo}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-black transition ${
            videoEnabled
              ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15"
              : "border border-rose-300/25 bg-rose-400/15 text-rose-100 hover:bg-rose-400/20"
          }`}
        >
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          {videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
        </button>
        <button
          onClick={leaveRoom}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5"
        >
          <FaPhoneSlash />
          Leave Room
        </button>
        </div>
      </div>
    </div>
  );
}

function VideoTile({ videoRef, userEmail, isSelf, streamReady }) {
  return (
    <div className="group relative min-h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/30">
      <video
        className="h-full min-h-72 w-full object-cover"
        ref={videoRef}
        autoPlay
        muted={isSelf}
        playsInline
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div>
          <p className="max-w-[15rem] truncate text-sm font-black text-white">{userEmail}</p>
          <p className="text-xs text-slate-300">{isSelf ? "You" : "Participant"} {!streamReady && "· Connecting"}</p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white">
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
    <div className="relative min-h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/30">
      <video
        className="h-full min-h-72 w-full object-cover"
        ref={ref}
        autoPlay
        playsInline
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="max-w-[15rem] truncate text-sm font-black text-white">{userEmail}</p>
        <p className="text-xs text-slate-300">Remote participant</p>
      </div>
    </div>
  );
}
