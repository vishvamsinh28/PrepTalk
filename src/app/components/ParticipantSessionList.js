"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ParticipantSessionList({ userEmail }) {
  const [sessions, setSessions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get("/api/session/list");
        const filtered = response.data.sessions.filter(session =>
          session.participants.includes(userEmail)
        );
        setSessions(filtered);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [userEmail]);

  if (sessions.length === 0) {
    return <p className="text-gray-500">No assigned sessions.</p>;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session._id} className="bg-white p-4 rounded shadow space-y-2">
          <h3 className="text-lg font-bold">{session.title}</h3>
          <p className="text-sm text-gray-600">{session.description}</p>
          <button
            onClick={() => router.push(`/session/${session._id}`)}
            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
          >
            Join Session
          </button>
        </div>
      ))}
    </div>
  );
}
