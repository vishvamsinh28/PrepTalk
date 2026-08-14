import { requestUserMedia, storeMediaPreferences, syncLocalVideoElement } from "./videoRoomMedia";

/* Verbatim extraction of the audio/video toggle handlers — parameterized on the
   hook state they close over. */
export function createMediaToggles({
  stream,
  audioEnabled,
  videoEnabled,
  setAudioEnabled,
  setVideoEnabled,
  setMediaError,
  peersRef,
  userVideo,
}) {
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
  return { toggleAudio, toggleVideo };
}
