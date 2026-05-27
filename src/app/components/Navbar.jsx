"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHome, FaSignOutAlt } from "react-icons/fa";

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

  const navItems = [
    {
      icon: <FaHome />,
      label: "Dashboard",
      path: getRoleHome(userRole),
      isActive: ["/interviewer", "/interviewee", "/dashboard"].includes(pathname),
    },
  ];

  const navigateTo = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "border-b border-white/10 bg-slate-950/75 shadow-lg shadow-black/20 backdrop-blur-xl"
        : "bg-slate-950/35 backdrop-blur-xl"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => router.push("/dashboard")}
            aria-label="PrepTalk dashboard"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 via-amber-300 to-cyan-300 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              PT
            </span>
            <span className="text-xl font-black tracking-tight text-white">PrepTalk</span>
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

            <div className="ml-2 border-l border-white/10 pl-4">
              <button
                onClick={handleLogout}
                className="flex items-center rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-300 px-4 py-2 text-sm font-black text-slate-950 shadow-md shadow-cyan-500/20 transition hover:-translate-y-0.5"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full border border-white/15 p-2 text-slate-200 hover:text-white focus:outline-none"
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
          <div className="glass-panel md:hidden rounded-b-3xl border-t-0 shadow-lg">
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
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-300 p-3 font-black text-slate-950"
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
      className={`flex items-center rounded-full px-4 py-2 text-sm font-bold transition-colors ${isActive
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
      className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm font-bold transition-colors ${isActive
        ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}
