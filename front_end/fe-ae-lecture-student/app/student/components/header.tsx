"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { Bell, ChevronDown, CircleArrowOutUpRight } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import NavItems from "./nav-items";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);      // User profile dropdown
  const [notificationOpen, setNotificationOpen] = useState(false); // Notifications panel

  const { user } = useAuth();
  const { logout, loading } = useLogout();

  // refs để detect click outside
  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get("accessToken") || "",
      logoutAllDevices: false,
    });
  };

  // ===== Handlers đảm bảo không đè UI nhau =====
  const toggleNotifications = () => {
    setNotificationOpen((prev) => {
      const next = !prev;
      if (next) setDropdownOpen(false); // mở notif -> đóng profile
      return next;
    });
  };

  const toggleProfile = () => {
    setDropdownOpen((prev) => {
      const next = !prev;
      if (next) setNotificationOpen(false); // mở profile -> đóng notif
      return next;
    });
  };

  // Đóng khi click ra ngoài
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickInsideProfile = profileRef.current?.contains(target);
      const clickInsideNotif = notifRef.current?.contains(target);

      if (!clickInsideProfile && !clickInsideNotif) {
        setDropdownOpen(false);
        setNotificationOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/student/home"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-105"
            aria-label="AI Enhance"
          >
            <div className="relative ml-2">
              <Image
                src="/ai-enhance-logo.svg"
                alt="AI Enhance"
                width={32}
                height={32}
                className="drop-shadow-sm"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                AI Enhance
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Student Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavItems />
          </nav>
        </div>

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-5">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </span>
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setNotificationOpen(false)}
                  >
                    <p className="text-sm text-gray-800">
                      You have new assignments to review
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setNotificationOpen(false)}
                  >
                    <p className="text-sm text-gray-800">
                      Course “CS101” has a new announcement
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 hover:shadow-md transition-all"
              onClick={toggleProfile}
              aria-expanded={dropdownOpen}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}` || "ST" : "ST"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : "Bob Wilson"}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? user.role : "Student"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold cursor-text text-gray-900">
                    {user ? `${user.firstName} ${user.lastName}` : "Bob Wilson"}
                  </p>
                  <p className="text-sm cursor-text text-gray-500">
                    {user ? user.email : "student.bob@university.edu"}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/student/profile/my-profile"
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                    Profile
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    <CircleArrowOutUpRight className="w-4 h-4" />
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
