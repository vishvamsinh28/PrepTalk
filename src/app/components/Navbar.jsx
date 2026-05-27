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
        ? "bg-gray-900 border-b border-gray-800 shadow-lg"
        : "bg-gray-900/80 backdrop-blur-sm"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center text-xl font-bold cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
              PrepTalk
            </span>
          </div>

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

            <div className="pl-4 ml-2 border-l border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-sky-500/20"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-sky-400 focus:outline-none"
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
          <div className="md:hidden bg-gray-800 rounded-b-lg shadow-lg border border-gray-700 border-t-0">
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

              <div className="pt-4 mt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white p-3 rounded-lg font-medium"
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
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
        ? "bg-sky-500/10 text-sky-400"
        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
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
      className={`flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
        ? "bg-sky-500/10 text-sky-400"
        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
        }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}
