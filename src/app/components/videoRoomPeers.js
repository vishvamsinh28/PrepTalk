import Peer from "simple-peer";
import { WEBRTC_CONFIG } from "./videoRoomConfig";

/* Verbatim extraction of peer setup — parameterized on the refs it closes over. */
export function createPeerHelpers({ channelRef, connectionIdRef, streamsRef, userEmail }) {
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

  const leaveRoom = () => {
    channelRef.current?.presence.leave().catch(() => {});
    ablyRef.current?.close();
    streamRef.current?.getTracks().forEach(track => track.stop());
    router.push("/dashboard");
  };
  return { shouldInitiatePeer, createPeer, addPeer };
}
