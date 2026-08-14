/**
 * @file Camera/microphone access and preference persistence for the video room.
 * Every function here is SSR-safe, since the hook that calls them runs during
 * the first client render.
 */

/** localStorage key for persisted mic/camera preferences. */
export const MEDIA_PREF_KEY = "preptalk-media-preferences";

/**
 * Reads persisted mic/camera preferences, defaulting both to enabled.
 * Returns defaults on the server and on any parse failure, so corrupt
 * localStorage degrades to "everything on" rather than breaking the room.
 * @returns {{ audioEnabled: boolean, videoEnabled: boolean }} Stored preferences, or defaults.
 */
export function getStoredMediaPreferences() {
  if (typeof window === "undefined") {
    return { audioEnabled: true, videoEnabled: true };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(MEDIA_PREF_KEY) || "{}");
    // `??` not `||`, so an explicitly stored `false` survives.
    return {
      audioEnabled: parsed.audioEnabled ?? true,
      videoEnabled: parsed.videoEnabled ?? true,
    };
  } catch {
    // Corrupt or unreadable storage — fall back to defaults rather than throw.
    return { audioEnabled: true, videoEnabled: true };
  }
}

/**
 * Persists mic/camera preferences so they carry to the next session.
 * No-ops during SSR. A quota or privacy-mode failure will throw — callers treat
 * persistence as best-effort.
 * @param {{ audioEnabled: boolean, videoEnabled: boolean }} nextPreferences - Full state to store.
 * @returns {void}
 */
export function storeMediaPreferences(nextPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEDIA_PREF_KEY, JSON.stringify(nextPreferences));
}

/**
 * Points a `<video>` element at a MediaStream.
 * Tolerates a null element because the ref may not be attached yet on the first
 * render after the stream resolves.
 * @param {HTMLVideoElement|null} videoElement - Target element, or null.
 * @param {MediaStream|null} mediaStream - Stream to display; null detaches.
 * @returns {void}
 */
export function syncLocalVideoElement(videoElement, mediaStream) {
  if (videoElement) {
    videoElement.srcObject = mediaStream;
  }
}

/**
 * Creates an empty MediaStream for joining with mic and camera both off.
 * Peers still need *a* stream to negotiate against, which is why this exists
 * rather than passing null.
 * @returns {MediaStream|null} Empty stream, or null where unsupported (SSR).
 */
export function createEmptyMediaStream() {
  if (typeof MediaStream === "undefined") {
    return null;
  }

  return new MediaStream();
}

/**
 * Requests camera/microphone access, falling back to the legacy callback API.
 * The fallback matters mainly for older WebViews; note the modern API is absent
 * on insecure origins too, which is why the error mentions HTTPS.
 * @param {MediaStreamConstraints} constraints - e.g. `{ video: true, audio: false }`.
 * @returns {Promise<MediaStream>} The granted stream.
 * @throws {Error} Rejects during SSR, when no getUserMedia exists, or with the
 *   browser's own `NotAllowedError` / `NotFoundError` when the user denies or
 *   has no device.
 */
export function requestUserMedia(constraints) {
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

  // Legacy API is callback-based; wrap it so callers get one promise contract.
  return new Promise((resolve, reject) => {
    legacyGetUserMedia.call(navigator, constraints, resolve, reject);
  });
}
