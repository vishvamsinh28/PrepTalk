"use client";

import { useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import { getJson, patchJson } from "@/lib/clientApi";

/**
 * Realtime shared notes + dark code pad, autosaved on a debounce and
 * synced over Ably.
 * @param {{ sessionId: string }} props
 */
export default function SharedWorkspace({ sessionId }) {
  const [workspace, setWorkspace] = useState({ notes: "", code: "" });
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);
  const ablyRef = useRef(null);
  const channelRef = useRef(null);
  const connectionIdRef = useRef("");
  const saveTimerRef = useRef(null);
  const skipNextSaveRef = useRef(false);
  // Mirrors `workspace` so an in-flight save can tell, at resolve time, whether
  // the user typed while it was away.
  const latestWorkspaceRef = useRef(workspace);

  useEffect(() => {
    latestWorkspaceRef.current = workspace;
  }, [workspace]);

  useEffect(() => {
    let isMounted = true;
    getJson(`/api/session/${sessionId}/workspace`)
      .then((data) => {
        if (!isMounted) return;
        skipNextSaveRef.current = true;
        setWorkspace(data.workspace || { notes: "", code: "" });
        setLoaded(true);
      })
      .catch((error) => console.error("Workspace fetch error:", error));

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  useEffect(() => {
    const ably = new Ably.Realtime({ authUrl: `/api/ably/token?sessionId=${encodeURIComponent(sessionId)}` });
    const channel = ably.channels.get(`workspace:${sessionId}`);
    ablyRef.current = ably;
    channelRef.current = channel;

    const handleWorkspaceUpdate = (event) => {
      if (event.connectionId === connectionIdRef.current) return;
      skipNextSaveRef.current = true;
      setWorkspace(event.data?.workspace || { notes: "", code: "" });
      setStatus("Updated from session");
    };

    const setupRealtime = async () => {
      if (ably.connection.state !== "connected") {
        await new Promise((resolve, reject) => {
          ably.connection.once("connected", resolve);
          ably.connection.once("failed", reject);
        });
      }

      connectionIdRef.current = ably.connection.id;
      await channel.subscribe("workspace-update", handleWorkspaceUpdate);
    };

    setupRealtime().catch((error) => console.error("Workspace realtime error:", error));

    return () => {
      channel.unsubscribe("workspace-update", handleWorkspaceUpdate);
      ably.close();
    };
  }, [sessionId]);

  /**
   * Persists the workspace and mirrors it to the other participant.
   * If the user typed while the request was in flight, the server echo is
   * discarded rather than applied — adopting it would silently overwrite the
   * newer keystrokes, and the debounce has already queued a save for them.
   * @param {{ notes: string, code: string }} [nextWorkspace] - Snapshot to save.
   * @param {boolean} [publish=true] - Whether to broadcast the saved copy.
   * @returns {Promise<void>}
   */
  const saveWorkspace = async (nextWorkspace = workspace, publish = true) => {
    setStatus("Saving...");
    try {
      const data = await patchJson(`/api/session/${sessionId}/workspace`, {
        ...nextWorkspace,
      });
      const savedWorkspace = data.workspace || nextWorkspace;
      const current = latestWorkspaceRef.current;
      const supersededByLocalEdit =
        current?.notes !== nextWorkspace.notes || current?.code !== nextWorkspace.code;

      if (supersededByLocalEdit) {
        // Newer local text wins; its own debounced save is already pending, and
        // publishing this stale copy would push it to the other participant.
        setStatus("Unsaved changes");
        return;
      }

      skipNextSaveRef.current = true;
      setWorkspace(savedWorkspace);
      setStatus("Saved");
      if (publish) {
        await channelRef.current?.publish("workspace-update", {
          workspace: savedWorkspace,
        });
      }
    } catch (error) {
      setStatus(error.message || "Save failed");
    }
  };

  const clearWorkspaceField = (field) => {
    setWorkspace((current) => ({ ...current, [field]: "" }));
  };

  const clearWorkspace = () => {
    setWorkspace({ notes: "", code: "" });
  };

  useEffect(() => {
    if (!loaded) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    setStatus("Unsaved changes");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveWorkspace(workspace);
    }, 800);

    return () => clearTimeout(saveTimerRef.current);
  }, [workspace, loaded]);

  const autoGrow = (event, maxHeight = 320) => {
    event.currentTarget.style.height = "auto";
    const nextHeight = Math.min(event.currentTarget.scrollHeight, maxHeight);
    event.currentTarget.style.height = `${nextHeight}px`;
    event.currentTarget.style.overflowY = event.currentTarget.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
        <div>
          <p className="app-eyebrow">Workspace</p>
          <h2 className="app-h2 mt-3">Whiteboard & coding pad</h2>
        </div>
        {/* Autosaves on a debounce — the status line is the real save indicator */}
        <p className="app-eyebrow" role="status">
          {status || "Autosaves as you type"}
        </p>
      </div>

      <div className="mt-6 grid gap-x-10 gap-y-6 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-ink">Shared notes</span>
            <button
              type="button"
              onClick={() => clearWorkspaceField("notes")}
              className="text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Clear
            </button>
          </span>
          <textarea
            value={workspace.notes}
            onChange={(event) => {
              setWorkspace({ ...workspace, notes: event.target.value });
              autoGrow(event);
            }}
            placeholder="Capture decisions, hints, diagrams, or feedback…"
            className="field-surface max-h-80 min-h-36 w-full rounded-[4px] p-4 text-sm leading-[1.6]"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-ink">Code pad</span>
            <button
              type="button"
              onClick={() => clearWorkspaceField("code")}
              className="text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Clear
            </button>
          </span>
          <textarea
            value={workspace.code}
            onChange={(event) => {
              setWorkspace({ ...workspace, code: event.target.value });
              autoGrow(event);
            }}
            placeholder="Pseudocode, SQL, JavaScript, or system design notes…"
            className="max-h-80 min-h-36 w-full rounded-[4px] bg-[#151311] p-4 font-mono text-sm leading-[1.6] text-[#f4f1ea] outline-none placeholder:text-white/35"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-5 text-[13px]">
        <button
          onClick={() => saveWorkspace(workspace)}
          className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
        >
          Save now
        </button>
        <button
          onClick={clearWorkspace}
          className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          Clear all
        </button>
      </div>
    </section>
  );
}
