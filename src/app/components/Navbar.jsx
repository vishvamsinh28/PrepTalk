"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PrepTalkLogo from "./PrepTalkLogo";

function getRoleHome(role) {
  if (role === "Interviewer") return "/interviewer";
  if (role === "Interviewee") return "/interviewee";
  return "/dashboard";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) return;

        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("User not logged in");
      }
    };

    fetchUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      // refresh() purges the router cache — without it the already-visited
      // authenticated pages stay cached and still render after logout.
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (["/login", "/register", "/"].includes(pathname)) return null;

  const interviewPath = userRole === "Interviewer" ? "/interviewer" : "/interviewee";
  const isInterviewActive = ["/interviewer", "/interviewee", "/session"].some((path) =>
    pathname.startsWith(path)
  );
  const navItems = ["Interviewer", "Interviewee"].includes(userRole)
    ? [
        { label: "Dashboard", path: "/dashboard", isActive: pathname === "/dashboard" },
        { label: "Interview", path: interviewPath, isActive: isInterviewActive },
        { label: "Lab", path: "/lab", isActive: pathname.startsWith("/lab") },
      ]
    : [];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b px-8 transition-colors duration-200 ${
        isScrolled
          ? "border-rule bg-canvas/95 backdrop-blur-sm"
          : "border-transparent bg-canvas"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[84rem] items-center gap-10">
        <button
          className="flex items-center gap-2.5 text-left"
          onClick={() => router.push(getRoleHome(userRole))}
          aria-label="PrepTalk home"
        >
          <PrepTalkLogo showWord={false} markClassName="h-7 w-7" />
          <span className="text-[17px] font-semibold tracking-tight text-ink">PrepTalk</span>
        </button>

        {navItems.length > 0 && (
          <div className="flex items-center gap-7">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-1 text-sm transition-colors ${
                  item.isActive
                    ? "text-ink underline decoration-accent decoration-2 underline-offset-[6px]"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="ml-auto text-sm text-ink-soft transition-colors hover:text-ink"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
