"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
/** @file Fixed top navigation for signed-in pages. Renders nothing on the landing and auth routes. */

import PrepTalkLogo from "./PrepTalkLogo";

/**
 * Home route for a role, used by the logo button.
 * Falls back to `/dashboard` while the role is still loading, so the logo is
 * never a dead click.
 * @param {string|null} role - Role from `/api/user`, or null before it resolves.
 * @returns {string} Path to navigate to.
 */
function getRoleHome(role) {
  if (role === "Interviewer") return "/interviewer";
  if (role === "Interviewee") return "/interviewee";
  return "/dashboard";
}

/**
 * App navigation for signed-in pages, with role-aware links and logout.
 * Fetches its own role rather than taking it as a prop, because it's mounted
 * once in the root layout and has no server-rendered parent to pass it down.
 * Links stay hidden until that resolves, so nothing flashes for logged-out users.
 * Logout does `replace` then `refresh`: clearing the cookie alone leaves
 * already-visited authenticated pages in the router cache, still rendering.
 * @returns {JSX.Element|null} The nav, or null on `/`, `/login`, and `/register`.
 */
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
        // A 401 already returned above, so reaching here means the request
        // itself failed — log the cause rather than assuming "logged out".
        console.error("Could not resolve current user:", error);
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

  // Landing and auth pages carry their own branding, so the app nav is omitted.
  // Placed after the hooks above — an early return before them would break the
  // rules of hooks on navigation between a nav and no-nav route.
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
