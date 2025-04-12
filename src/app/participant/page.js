import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import SessionList from "../components/SessionList";

export default async function ParticipantPage() {
    const cookieStore = cookies();
    const token = cookieStore.get("prepTalkToken")?.value;

    if (!token) {
        return <p className="text-center mt-10">No token found. Please login.</p>;
    }

    let userData;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userData = payload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return <p className="text-center mt-10 text-red-500">Invalid token. Please login again.</p>;
    }

    if (userData.role !== "Participant") {
        return <p className="text-center mt-10 text-red-500">Access Denied: Participant only page.</p>;
    }

    return (
        <div className="flex min-h-screen justify-center items-center flex-col bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Participant Panel 🗣️</h1>
            <p>Welcome, {userData.email}!</p>
            <p>Your role: <strong>{userData.role}</strong></p>
            <div className="mt-12 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Available Sessions</h2>
                <SessionList />
            </div>
        </div>
    );
}
