/**
 * localStorage key for persisted mic/camera preferences.
 */
export const MEDIA_PREF_KEY = "preptalk-media-preferences";

/**
 * Reads persisted mic/camera preferences; defaults to enabled.
 * @returns {{ audioEnabled: boolean, videoEnabled: boolean }}
 */
export function getStoredMediaPreferences() {
  if (typeof window === "undefined") {
    return { audioEnabled: true, videoEnabled: true };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(MEDIA_PREF_KEY) || "{}");
    return {
      audioEnabled: parsed.audioEnabled ?? true,
      videoEnabled: parsed.videoEnabled ?? true,
    };
  } catch {
    return { audioEnabled: true, videoEnabled: true };
  }
}

/**
 * Persists mic/camera preferences to localStorage.
 * @param {{ audioEnabled: boolean, videoEnabled: boolean }} nextPreferences
 */
export function storeMediaPreferences(nextPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEDIA_PREF_KEY, JSON.stringify(nextPreferences));
}

/**
 * Points a <video> element at a MediaStream.
 * @param {HTMLVideoElement|null} videoElement
 * @param {MediaStream|null} mediaStream
 */
export function syncLocalVideoElement(videoElement, mediaStream) {
  if (videoElement) {
    videoElement.srcObject = mediaStream;
  }
}

/**
 * Creates an empty MediaStream, or null where unsupported (SSR).
 * @returns {MediaStream|null}
 */
export function createEmptyMediaStream() {
  if (typeof MediaStream === "undefined") {
    return null;
  }

  return new MediaStream();
}

/**
 * getUserMedia with legacy-API fallback and friendly errors.
 * @param {MediaStreamConstraints} constraints
 * @returns {Promise<MediaStream>}
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

  return new Promise((resolve, reject) => {
    legacyGetUserMedia.call(navigator, constraints, resolve, reject);
  });
}
