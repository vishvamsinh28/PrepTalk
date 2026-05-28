"use client";

import { useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import { getJson, patchJson } from "@/lib/clientApi";
import { FaCode, FaEraser, FaSave } from "react-icons/fa";

export default function SharedWorkspace({ sessionId }) {
  const [workspace, setWorkspace] = useState({ notes: "", code: "" });
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);
  const ablyRef = useRef(null);
  const channelRef = useRef(null);
  const connectionIdRef = useRef("");
  const saveTimerRef = useRef(null);
  const skipNextSaveRef = useRef(false);

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

  const saveWorkspace = async (nextWorkspace = workspace, publish = true) => {
    setStatus("Saving...");
    try {
      const data = await patchJson(`/api/session/${sessionId}/workspace`, {
        ...nextWorkspace,
      });
      const savedWorkspace = data.workspace || nextWorkspace;
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
    <section className="glass-panel rounded-xl p-5 sm:p-6">
      <div className="mb-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Workspace</p>
          <h2 className="mt-1 text-2xl font-black text-white">Whiteboard & coding pad</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={clearWorkspace}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-2.5 font-bold text-rose-100"
          >
            <FaEraser />
            Clear all
          </button>
          <button
            onClick={() => saveWorkspace(workspace)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-5 py-2.5 font-black text-slate-950"
          >
            <FaSave />
            Save
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="field-group">
          <span className="field-label">
            Shared notes
            <button
              type="button"
              onClick={() => clearWorkspaceField("notes")}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-bold text-slate-200"
            >
              <FaEraser />
              Clear
            </button>
          </span>
          <textarea
            value={workspace.notes}
            onChange={(event) => {
              setWorkspace({ ...workspace, notes: event.target.value });
              autoGrow(event);
            }}
            placeholder="Capture decisions, hints, diagrams, or feedback..."
            className="field-surface field-control max-h-80 min-h-36 transition"
          />
        </label>

        <label className="field-group">
          <span className="field-label justify-start">
            <FaCode />
            Code pad
            <button
              type="button"
              onClick={() => clearWorkspaceField("code")}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-bold text-slate-200"
            >
              <FaEraser />
              Clear
            </button>
          </span>
          <textarea
            value={workspace.code}
            onChange={(event) => {
              setWorkspace({ ...workspace, code: event.target.value });
              autoGrow(event);
            }}
            placeholder="Write pseudocode, SQL, JavaScript, or system design notes..."
            className="field-surface field-control max-h-80 min-h-36 font-mono text-sm transition"
          />
        </label>
      </div>

      {status && <p className="mt-3 text-sm text-slate-300">{status}</p>}
    </section>
  );
}
