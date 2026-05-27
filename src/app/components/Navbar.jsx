"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaClipboardCheck, FaListAlt, FaPlus, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
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

  const navItems = userRole === "Interviewer"
    ? [
        { icon: <FaPlus />, label: "Create", path: "/interviewer#create-session", isActive: false },
        { icon: <FaListAlt />, label: "Sessions", path: "/interviewer#sessions", isActive: false },
        { icon: <FaClipboardCheck />, label: "Reports", path: "/interviewer#reports", isActive: false },
      ]
    : userRole === "Interviewee"
      ? [
          { icon: <FaUserFriends />, label: "Interviews", path: "/interviewee", isActive: pathname === "/interviewee" },
          { icon: <FaClipboardCheck />, label: "Reports", path: "/interviewee#reports", isActive: false },
        ]
      : [];

  const navigateTo = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-5 py-4 backdrop-blur-sm">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between transition-all duration-300 ${
          isScrolled
            ? "rounded-2xl bg-slate-950/72 px-4 py-2 shadow-xl shadow-black/20"
            : ""
        }`}
      >
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
                className="flex items-center rounded-xl bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg border border-white/15 p-2 text-slate-200 hover:text-white focus:outline-none"
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
          <div className="absolute left-5 right-5 top-20 rounded-2xl border border-white/10 bg-slate-950/95 py-3 shadow-lg md:hidden">
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

              <div className="mt-3 border-t border-white/10 pt-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 p-3 font-black text-slate-950"
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
        ? "text-cyan-100"
        : "text-white/75 hover:text-white"
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
        ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}
