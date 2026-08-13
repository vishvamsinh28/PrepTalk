"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCode, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (["/login", "/register", "/"].includes(pathname)) return null;

  const interviewPath = userRole === "Interviewer" ? "/interviewer" : "/interviewee";
  const isInterviewActive = ["/interviewer", "/interviewee", "/session"].some((path) => pathname.startsWith(path));
  const navItems = ["Interviewer", "Interviewee"].includes(userRole)
    ? [
        { icon: <FaUserFriends />, label: "Interview", path: interviewPath, isActive: isInterviewActive },
        { icon: <FaCode />, label: "Lab", path: "/lab", isActive: pathname === "/lab" },
      ]
    : [];

  const navigateTo = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 px-5 transition-colors duration-200 ${
        isScrolled ? "border-b border-rule bg-canvas/95 backdrop-blur-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => router.push(getRoleHome(userRole))}
            aria-label="PrepTalk home"
          >
            <PrepTalkLogo />
          </button>

          <div className="hidden items-center gap-3 md:flex">
            {navItems.length > 0 && (
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => navigateTo(item.path)}
                    isActive={item.isActive}
                  />
                ))}
              </div>
            )}

            <div>
              <button
                onClick={handleLogout}
                className="flex items-center rounded-[4px] bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-85"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg border border-rule p-2 text-ink hover:text-ink focus:outline-none"
            >
              {!isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        {isMenuOpen && (
          <div className="absolute left-5 right-5 top-20 rounded-2xl border border-rule bg-white py-3 shadow-lg md:hidden">
            <div className="space-y-1 px-2">
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => navigateTo(item.path)}
                  isActive={item.isActive}
                />
              ))}

              <div className="mt-3 border-t border-rule pt-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-ink p-3 font-semibold text-canvas"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavItem({ icon, label, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${isActive
        ? "text-accent"
        : "text-ink-soft hover:text-ink"
        }`}
    >
      <span className="mr-1.5">{icon}</span>
      {label}
    </button>
  );
}

function MobileNavItem({ icon, label, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center rounded-lg px-3 py-3 text-sm font-bold transition-colors ${isActive
        ? "border border-accent bg-accent/10 text-accent"
        : "text-ink-soft hover:bg-black/5 hover:text-ink"
        }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}
