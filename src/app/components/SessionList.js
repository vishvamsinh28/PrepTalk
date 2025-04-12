"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SessionList() {
    const router = useRouter();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get("/api/session/list");
                setSessions(response.data.sessions);
            } catch (error) {
                console.error("Error fetching sessions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    if (loading) {
        return <p className="text-center">Loading sessions...</p>;
    }

    if (sessions.length === 0) {
        return <p className="text-center text-gray-500">No sessions found.</p>;
    }

    return (
        <div className="space-y-4 mt-6">
            {sessions.map((session) => (
                <div key={session._id} className="bg-white p-4 rounded shadow space-y-2">
                    <h3 className="text-lg font-bold">{session.title}</h3>
                    <p className="text-sm text-gray-600">{session.description}</p>
                    <p className="text-xs text-gray-400">Created by: {session.createdBy}</p>

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
