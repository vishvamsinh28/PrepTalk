/**
 * @file Mic and camera toggles for the video room.
 * Muting here *stops and removes* the track rather than setting `enabled =
 * false`, so the browser's hardware indicator actually goes out — the tradeoff
 * is that unmuting must re-request the device and renegotiate with every peer.
 */

import { requestUserMedia, storeMediaPreferences, syncLocalVideoElement } from "./videoRoomMedia";

/**
 * Builds the audio and video toggle handlers.
 * Takes hook state as arguments, so these are rebuilt each render and always
 * see the current `stream` and enabled flags.
 * @param {object} deps - State and setters from `useVideoRoom`.
 * @param {MediaStream|null} deps.stream - Local stream; both toggles no-op without it.
 * @param {boolean} deps.audioEnabled - Current mic state.
 * @param {boolean} deps.videoEnabled - Current camera state.
 * @param {Function} deps.setAudioEnabled - Mic state setter.
 * @param {Function} deps.setVideoEnabled - Camera state setter.
 * @param {Function} deps.setMediaError - Surfaces device errors to the UI.
 * @param {{current: Array<{peer: object}>}} deps.peersRef - Live peers to renegotiate against.
 * @param {{current: HTMLVideoElement|null}} deps.userVideo - Local preview element.
 * @returns {{toggleAudio: Function, toggleVideo: Function}} Toggle handlers.
 */
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
  /**
   * Mutes by stopping and removing the mic track, unmutes by re-acquiring it.
   * Preferences are written on each path so the choice survives a rejoin.
   * @returns {void} Async work is fire-and-forget; failures surface via `setMediaError`.
   */
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

  /**
   * Same stop-and-reacquire cycle as `toggleAudio`, plus a local preview resync.
   * `syncLocalVideoElement` runs on both paths because removing the track leaves
   * the `<video>` element showing a frozen last frame otherwise.
   * @returns {void} Async work is fire-and-forget; failures surface via `setMediaError`.
   */
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
