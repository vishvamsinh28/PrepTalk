"use client";

import { useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import { useRouter } from "next/navigation";
import {
  createEmptyMediaStream,
  getStoredMediaPreferences,
  requestUserMedia,
  syncLocalVideoElement,
} from "./videoRoomMedia";
import { createMediaToggles } from "./videoRoomToggles";
import { createPeerHelpers } from "./videoRoomPeers";

/**
 * All state and signaling for a session video room: local media,
 * peer connections, presence, and the leave/toggle handlers.
 * @param {string} sessionId
 * @param {string} userEmail
 */
export function useVideoRoom(sessionId, userEmail) {
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

  const { shouldInitiatePeer, createPeer, addPeer } = createPeerHelpers({
    channelRef,
    connectionIdRef,
    streamsRef,
    userEmail,
  });

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

  const { toggleAudio, toggleVideo } = createMediaToggles({
    stream,
    audioEnabled,
    videoEnabled,
    setAudioEnabled,
    setVideoEnabled,
    setMediaError,
    peersRef,
    userVideo,
  });

  return {
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
  };
}
