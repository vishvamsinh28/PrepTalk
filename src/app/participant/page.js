import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import ParticipantSessionList from "../components/ParticipantSessionList";

export default async function ParticipantPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("prepTalkToken")?.value;

  let userData;

  if (token) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    userData = payload;
  }

  return (
    <div className="flex min-h-screen justify-center items-center flex-col bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Participant Panel 🗣️</h1>
      <p>Welcome, {userData?.email}!</p>

      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Your Sessions</h2>
        <ParticipantSessionList userEmail={userData?.email} />
      </div>
    </div>
  );
}
