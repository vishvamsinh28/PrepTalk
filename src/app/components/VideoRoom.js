"use client";

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export default function VideoRoom({ sessionId, userEmail }) {
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState([{ socketId: "self", userEmail }]);

  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);

        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }

        socket.emit("joinVideoRoom", sessionId, userEmail);

        // Listen for new participants
        socket.on("userJoinedVideoRoom", ({ socketId, userEmail }) => {
          const peer = createPeer(socketId, socket.id, currentStream);
          peersRef.current.push({ peerId: socketId, peer, userEmail });
          setPeers(users => [...users, peer]);
          setParticipants(p => [...p, { socketId, userEmail }]);
        });

        socket.on("userIncomingSignal", ({ callerId, signal }) => {
          const peer = addPeer(signal, callerId, currentStream);
          peersRef.current.push({ peerId: callerId, peer });
          setPeers(users => [...users, peer]);
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
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      {/* Participants Grid */}
      <div className="flex flex-wrap gap-6 justify-center">
        {/* Self Video */}
        <div className="flex flex-col items-center">
          <video
            className="w-64 rounded shadow mb-2"
            ref={userVideo}
            autoPlay
            muted
            playsInline
          />
          <span className="text-sm text-gray-600">{userEmail} (You)</span>
        </div>

        {/* Other Peers */}
        {peers.map((peer, index) => (
          <Video
            key={index}
            peer={peer}
            userEmail={participants[index + 1]?.userEmail || "Participant"}
          />
        ))}
      </div>

      {/* Waiting Message */}
      {participants.length <= 1 && (
        <p className="text-gray-500 mt-4 animate-pulse">
          Waiting for others to join the video room...
        </p>
      )}

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

function Video({ peer, userEmail }) {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <div className="flex flex-col items-center">
      <video
        className="w-64 rounded shadow mb-2"
        ref={ref}
        autoPlay
        playsInline
      />
      <span className="text-sm text-gray-600">{userEmail}</span>
    </div>
  );
}
