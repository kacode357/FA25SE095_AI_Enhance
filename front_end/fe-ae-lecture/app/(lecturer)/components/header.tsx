"use client";

import {
  Bell,
  ChevronDown,
  CircleArrowOutUpRight,
  Menu,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLogout } from "@/hooks/auth/useLogout";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";

type Props = { onMenuClick?: () => void };

export default function ManagerHeader({ onMenuClick }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { user } = useAuth();
  const { logout, loading } = useLogout();

  const handleLogout = () => {
    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get("accessToken") || "",
      logoutAllDevices: false,
    });
  };

  return (
    <header className="h-20 bg-white backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 sm:px-2">
        {/* Brand Section */}
        <div className="flex items-center gap-3 sm:gap-14">
          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Open sidebar"
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-105"
            aria-label="AI Enhance"
          >
            <div className="relative">
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
                Lecturer Manager
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-black" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-80 bg-gray-50 text-black border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {/* Notifications */}
          <div className="relative cursor-pointer">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 cursor-pointer rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </span>
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800">
                      Có 3 bài tập mới được nộp
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 phút trước</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800">
                      Lớp CS101 có tin nhắn mới
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 phút trước</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative cursor-pointer">
            <button
              className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 hover:shadow-md transition-all"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user
                    ? user.firstName[0] + user.lastName[0]
                    : "LT"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user
                    ? `${user.firstName} ${user.lastName}`
                    : "Lecturer User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? user.role : "Lecturer"}
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
                    {user
                      ? `${user.firstName} ${user.lastName}`
                      : "Lecturer Tran"}
                  </p>
                  <p className="text-sm cursor-text text-gray-500">
                    {user ? user.email : "lecturer.tran@university.edu"}
                  </p>
                </div>
                <div className="py-1">
  <Link
    href="/manager/profile"
    className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
  >
    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
    Personal profile
  </Link>
  <button className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
    Settings
  </button>
  <hr className="my-1 border-gray-200" />
  <button
    className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
