import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import DashboardClient from "../components/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("prepTalkToken")?.value;

  let userData;

  try {
    userData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error);
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-900 text-gray-100">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg max-w-md text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-lg font-medium">Invalid or expired token.</p>
          <p className="mt-2 text-sm">Please login again to continue.</p>
        </div>
      </div>
    );
  }

  return <DashboardClient userData={userData} />;
}
