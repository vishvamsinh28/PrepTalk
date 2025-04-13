"use client";

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useRouter } from "next/navigation";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  transports: ["websocket"],
});

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

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }

        socket.emit("joinVideoRoom", sessionId, userEmail);

        socket.on("userJoinedVideoRoom", ({ socketId, userEmail }) => {
          if (peersRef.current.find(p => p.peerId === socketId)) return;

          const peer = createPeer(socketId, socket.id, currentStream);
          peersRef.current.push({ peerId: socketId, peer, userEmail });
          setPeers(existing => [...existing, peer]);
          setParticipants(p => [...p, { socketId, userEmail }]);
        });

        socket.on("userIncomingSignal", ({ callerId, signal }) => {
          if (peersRef.current.find(p => p.peerId === callerId)) return;

          const peer = addPeer(signal, callerId, currentStream);
          peersRef.current.push({ peerId: callerId, peer });
          setPeers(existing => [...existing, peer]);
        });

        socket.on("receivingReturnedSignal", ({ id, signal }) => {
          const item = peersRef.current.find(p => p.peerId === id);
          if (item) {
            item.peer.signal(signal);
          }
        });

        socket.on("userLeftVideoRoom", ({ socketId }) => {
          const peerObj = peersRef.current.find(p => p.peerId === socketId);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          peersRef.current = peersRef.current.filter(p => p.peerId !== socketId);
          setPeers(peers => peers.filter(p => p.peerId !== socketId));
          setParticipants(p => p.filter(user => user.socketId !== socketId));
          delete streamsRef.current[socketId];
        });
      });

    return () => {
      socket.disconnect();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socket.emit("sendingSignal", { userToSignal, callerId, signal });
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
      socket.emit("returningSignal", { callerId, signal });
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
    socket.disconnect();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
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
            userEmail={participants[index + 1]?.userEmail || "Participant"}
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
