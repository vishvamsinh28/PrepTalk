import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import CreateSessionForm from "../components/CreateSessionForm";
import SessionList from "../components/SessionList";

export default async function ModeratorPage() {
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

    if (userData.role !== "Moderator") {
        return <p className="text-center mt-10 text-red-500">Access Denied: Moderator only page.</p>;
    }

    return (
        <div className="flex min-h-screen justify-center items-center flex-col bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Moderator Panel 🎤</h1>
            <p>Welcome, {userData.email}!</p>

            <div className="mt-8 w-full max-w-md">
                <CreateSessionForm />
            </div>
            <div className="mt-12 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Your Sessions</h2>
                <SessionList />
            </div>
        </div>
    );
}
