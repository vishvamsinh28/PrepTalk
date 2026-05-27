"use client";

import { useEffect, useState } from "react";
import { getJson, patchJson } from "@/lib/clientApi";
import { FaCode, FaSave } from "react-icons/fa";

export default function SharedWorkspace({ sessionId, inviteCode }) {
  const [workspace, setWorkspace] = useState({ notes: "", code: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const suffix = inviteCode ? `?invite=${encodeURIComponent(inviteCode)}` : "";
    getJson(`/api/session/${sessionId}/workspace${suffix}`)
      .then((data) => setWorkspace(data.workspace || { notes: "", code: "" }))
      .catch((error) => console.error("Workspace fetch error:", error));
  }, [sessionId, inviteCode]);

  const saveWorkspace = async () => {
    setStatus("Saving...");
    try {
      const data = await patchJson(`/api/session/${sessionId}/workspace`, {
        ...workspace,
        inviteCode,
      });
      setWorkspace(data.workspace || workspace);
      setStatus("Saved");
    } catch (error) {
      setStatus(error.message || "Save failed");
    }
  };

  const autoGrow = (event, maxHeight = 320) => {
    event.currentTarget.style.height = "auto";
    const nextHeight = Math.min(event.currentTarget.scrollHeight, maxHeight);
    event.currentTarget.style.height = `${nextHeight}px`;
    event.currentTarget.style.overflowY = event.currentTarget.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  return (
    <section className="glass-panel rounded-xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Workspace</p>
          <h2 className="mt-1 text-2xl font-black text-white">Whiteboard & coding pad</h2>
        </div>
        <button
          onClick={saveWorkspace}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-5 py-2.5 font-black text-slate-950"
        >
          <FaSave />
          Save
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="field-group">
          <span className="field-label">Shared notes</span>
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
