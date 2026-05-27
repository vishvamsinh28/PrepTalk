"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaClipboardCheck, FaListAlt, FaPlus, FaSignOutAlt, FaUserFriends } from "react-icons/fa";

function LogoMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950/70 ring-1 ring-white/15">
      <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
        <defs>
          <linearGradient id="ptNavGradient" x1="4" y1="4" x2="36" y2="36">
            <stop stopColor="#22d3ee" />
            <stop offset="0.55" stopColor="#34d399" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <path d="M8 10.5C8 7.46 10.46 5 13.5 5h13C29.54 5 32 7.46 32 10.5v19C32 32.54 29.54 35 26.5 35h-13C10.46 35 8 32.54 8 29.5v-19Z" fill="url(#ptNavGradient)" />
        <path d="M14 15h7.2c3.1 0 5.1 1.7 5.1 4.4s-2 4.4-5.1 4.4h-3.3V29H14V15Zm3.9 3v2.9H21c.9 0 1.5-.5 1.5-1.4S22 18 21 18h-3.1Z" fill="#071827" />
      </svg>
    </span>
  );
}

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
    <nav className="fixed left-0 right-0 top-3 z-50 px-4">
      <div
        className={`mx-auto max-w-6xl rounded-xl border px-3 transition-all duration-300 ${
          isScrolled
            ? "border-slate-700/70 bg-slate-950/82 shadow-2xl shadow-black/25 backdrop-blur-2xl"
            : "border-slate-700/50 bg-slate-950/58 shadow-xl shadow-black/10 backdrop-blur-xl"
        }`}
      >
        <div className="flex h-14 items-center justify-between">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => router.push(getRoleHome(userRole))}
            aria-label="PrepTalk home"
          >
            <LogoMark />
            <span className="text-lg font-black tracking-tight text-white">PrepTalk</span>
          </button>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                onClick={() => navigateTo(item.path)}
                isActive={item.isActive}
              />
            ))}

            <div className={navItems.length > 0 ? "ml-2 border-l border-white/10 pl-3" : ""}>
              <button
                onClick={handleLogout}
                className="flex items-center rounded-lg bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 px-3.5 py-2 text-sm font-black text-slate-950 shadow-md shadow-cyan-500/20 transition hover:-translate-y-0.5"
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
        </div>

        {isMenuOpen && (
          <div className="glass-panel md:hidden rounded-b-xl border-t-0 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => navigateTo(item.path)}
                  isActive={item.isActive}
                />
              ))}

              <div className="mt-4 border-t border-white/10 pt-4">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 p-3 font-black text-slate-950"
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
      className={`flex items-center rounded-lg px-3 py-2 text-sm font-bold transition-colors ${isActive
        ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
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
