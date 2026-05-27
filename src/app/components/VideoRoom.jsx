"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import Peer from "simple-peer";
import { useRouter } from "next/navigation";

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
    <div className="flex flex-col items-center p-4 space-y-4">
      {/* Video Grid */}
      <div className="flex flex-wrap gap-6 justify-center">
        {/* Self Video */}
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

      {/* Controls */}
      <div className="flex space-x-4 mt-4">
        <button
          onClick={toggleAudio}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          {audioEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button
          onClick={toggleVideo}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          {videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
        </button>
        <button
          onClick={leaveRoom}
          className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

function VideoTile({ videoRef, userEmail, isSelf, streamReady }) {
  return (
    <div className="flex flex-col items-center">
      <video
        className="w-64 rounded shadow mb-2 bg-black"
        ref={videoRef}
        autoPlay
        muted={isSelf}
        playsInline
      />
      <span className="text-sm text-gray-600">
        {userEmail} {isSelf && "(You)"}
        {!streamReady && " (Connecting...)"} 
      </span>
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
    <div className="flex flex-col items-center">
      <video
        className="w-64 rounded shadow mb-2 bg-black"
        ref={ref}
        autoPlay
        playsInline
      />
      <span className="text-sm text-gray-600">{userEmail}</span>
    </div>
  );
}
