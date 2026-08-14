"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
/** @file The candidate's session list. Read-only counterpart to `SessionList`. */

import { useRouter } from "next/navigation";

/**
 * Lists sessions assigned to the signed-in interviewee, each with a join button.
 * Hits the same `/api/session/list` endpoint as the interviewer view — the API
 * filters by role, so this component needs no role handling of its own.
 * Offers no delete or edit actions, which is the substantive difference from
 * `SessionList`; a candidate can only join.
 * A failed fetch falls through to the same empty state as "none assigned",
 * which is a known softening of a real error.
 * @returns {JSX.Element} The list, its empty state, or a loading line.
 */
export default function IntervieweeSessionList() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getJson("/api/session/list");
        setSessions(response.sessions || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (isLoading) {
    return <p className="app-eyebrow py-8">Loading sessions…</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="border-y border-rule py-14 text-center">
        <p className="app-h3">No sessions assigned yet.</p>
        <p className="mt-2 text-sm text-ink-soft">
          Your interviewer will send one through when it&rsquo;s scheduled.
        </p>
      </div>
    );
  }

  return (
    <ul>
      {sessions.map((session) => (
        <li
          key={session._id}
          className="row-hair flex flex-wrap items-start justify-between gap-x-10 gap-y-4 px-1 py-6"
        >
          <div className="min-w-0 max-w-[52rem]">
            <h3 className="app-h3">{session.title}</h3>
            {session.description && (
              <p className="mt-2 max-w-[62ch] text-sm leading-[1.7] text-ink-soft">
                {session.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="chip chip-accent">{session.role}</span>
              <span className="chip">{session.level}</span>
              <span className="chip">{session.interviewType}</span>
              {session.skills?.map((skill) => (
                <span key={skill} className="chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push(`/session/${session._id}`)}
            className="btn-ink shrink-0"
          >
            Join session
          </button>
        </li>
      ))}
    </ul>
  );
}
