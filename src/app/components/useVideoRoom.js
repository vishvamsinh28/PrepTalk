"use client";

/**
 * @file The video room hook. Owns local media, WebRTC peers, and Ably presence
 * for one session. Peer construction lives in `videoRoomPeers`, device toggles
 * in `videoRoomToggles`, and getUserMedia wrapping in `videoRoomMedia`; this
 * file is the state and lifecycle that ties them together.
 */

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
 * Owns everything the video room needs: local media, peer connections,
 * presence, and the leave/toggle handlers.
 * State is mirrored into refs (`peersRef`, `streamRef`) because the Ably
 * callbacks below outlive the render that created them and would otherwise read
 * stale values.
 * @param {string} sessionId - Session whose `video:` channel to join.
 * @param {string} userEmail - Published in presence so peers can label tiles.
 * @returns {{peers: object[], stream: MediaStream|null, mediaError: string,
 *   audioEnabled: boolean, videoEnabled: boolean, participants: object[],
 *   userVideo: object, streamsRef: object, toggleAudio: Function,
 *   toggleVideo: Function, leaveRoom: Function}} Room state and controls.
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

  // Acquires local media, then joins the room. Re-runs only when the session or
  // identity changes; the cleanup fully tears down peers, tracks, and the Ably
  // connection so a remount never leaves a ghost participant behind.
  useEffect(() => {
    let isMounted = true;
    let didSetupRealtime = false;
    const ably = new Ably.Realtime({ authUrl: `/api/ably/token?sessionId=${encodeURIComponent(sessionId)}` });
    const channel = ably.channels.get(`video:${sessionId}`);
    ablyRef.current = ably;
    channelRef.current = channel;

    /**
     * Tears down a peer that left, clearing it from ref, state, and stream map.
     * Destroying before filtering matters — an undestroyed peer keeps its
     * RTCPeerConnection and transceivers alive after the tile disappears.
     * @param {string} connectionId - Ably connection id of the departed peer.
     * @returns {void}
     */
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

    // Ably invokes this as a bare callback, so a rejection has no caller to
    // catch it. presence.get() throws whenever the connection drops or closes,
    // including on unmount, so the boundary lives here rather than inline —
    // wrapping applyPresence's body would push its loop past three levels.
    const syncPresence = async () => {
      try {
        await applyPresence();
      } catch (error) {
        if (isMounted) console.error("Unable to sync video presence:", error);
      }
    };

    /** Reads current presence, updates participants, and dials any new peers. */
    const applyPresence = async () => {
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

    /**
     * Routes incoming offers and answers to the right peer.
     * The guard drops anything addressed elsewhere, echoed back from us, or
     * arriving before local media exists — a peer built without a stream would
     * negotiate with no tracks and show a permanently black tile.
     * @param {{name: string, data: object}} event - Ably `signal-offer` or `signal-answer`.
     * @returns {void}
     */
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

    /**
     * Resolves once the Ably connection is usable.
     * Checked synchronously first, since a warm client may already be connected
     * and `once("connected")` would then never fire.
     * @returns {Promise<void>} Resolves on connect; rejects if the connection fails.
     */
    const waitForConnection = () => {
      if (ably.connection.state === "connected") {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        ably.connection.once("connected", resolve);
        ably.connection.once("failed", reject);
      });
    };

    /**
     * Connects, subscribes to signalling and presence, then announces us.
     * Order is load-bearing: subscriptions are attached *before* `presence.enter`
     * so an offer from someone who sees us arrive is never missed. The
     * `didSetupRealtime` latch guards against React StrictMode's double-invoke
     * in development, which would otherwise enter presence twice.
     * @returns {Promise<void>} Resolves once the room is fully joined.
     */
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

    // With both devices off we still need a stream object to negotiate against,
    // hence the empty-stream branch rather than skipping getUserMedia entirely.
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

  /**
   * Leaves presence, closes the connection, stops local tracks, then routes
   * back to the dashboard. Lives here rather than in `createPeerHelpers`
   * because it needs `ablyRef`, `streamRef`, and the router from this scope.
   */
  const leaveRoom = () => {
    channelRef.current?.presence.leave().catch(() => {});
    ablyRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    router.push("/dashboard");
  };

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
