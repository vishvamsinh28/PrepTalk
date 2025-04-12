"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/user");
        setUserRole(response.data.role);
      } catch (error) {
        console.error("User not logged in");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (["/login", "/register", "/"].includes(pathname)) return null;

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <div className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => router.push("/")}>
        PrepTalk 🎙️
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => router.push(userRole === "Moderator" ? "/moderator" : userRole === "Participant" ? "/participant" : "/evaluator")}
          className="text-gray-700 hover:text-blue-600 transition"
        >
          Dashboard
        </button>

        {userRole === "Moderator" && (
          <>
            <button
              onClick={() => router.push("/moderator/analytics")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Analytics
            </button>

            <button
              onClick={() => router.push("/feedbacks")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Feedbacks
            </button>
          </>
        )}

        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
