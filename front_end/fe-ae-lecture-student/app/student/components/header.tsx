"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";

import Logo from "@/components/logo/Logo";
import NotificationsMenu from "@/components/notifications/NotificationsMenu";
import UserMenu from "@/components/user/UserMenu";
import { useStudentNav } from "./nav-items";

export default function Header() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user } = useAuth();
  const { logout } = useLogout();

  const navs = useStudentNav();

  const handleLogout = () => {
    setDropdownOpen(false);
    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get("accessToken") || "",
      logoutAllDevices: false,
    });
  };

  return (
    <header className="sticky flex flex-row gap-10 py-3 text-center justify-center px-10 items-center top-0 z-40 backdrop-blur-sm">
      <div className="flex h-16 gap-10 items-center justify-between px-6">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-30">
          <div className="items-center">
            <Logo />
          </div>
          {/* NAV UI: dùng màu từ globals.css (text-nav / text-nav-active) */}
          <nav className="hidden items-center gap-10 md:flex">
            {navs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="no-underline"
                aria-current={item.isActive ? "page" : undefined}
              >
                <span
                  className={
                    "text-base font-semibold leading-none transition-colors visited:text-nav " +
                    (item.isActive
                      ? "text-nav-active underline" // active: tím
                      : "text-nav hover:text-nav-active focus:text-nav-active active:text-nav-active")
                  }
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div>
          {/* Right: notifications + profile */}
          <NotificationsMenu
            open={notificationOpen}
            onOpenChange={(v) => {
              setNotificationOpen(v);
              if (v) setDropdownOpen(false); // mở notif -> đóng profile
            }}
            badgeCount={3}
          />
        </div>
        <div>
          <UserMenu
            open={dropdownOpen}
            onOpenChange={(v) => {
              setDropdownOpen(v);
              if (v) setNotificationOpen(false); // mở profile -> đóng notif
            }}
            user={user ?? null}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
