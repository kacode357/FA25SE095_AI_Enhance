"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";

import Logo from "@/components/logo/Logo";
import NotificationsMenu from "@/components/notifications/NotificationsMenu";
import UserMenu from "@/components/user/UserMenu";
import { ROLE_LECTURER, UserServiceRole } from "@/config/user-service/user-role";
import { useStudentNav } from "./nav-items";

export default function Header() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user } = useAuth();
  const { logout } = useLogout();

  const navs = useStudentNav();
  const isLecturer = user?.role === UserServiceRole[ROLE_LECTURER];

  const handleLogout = () => {
    setDropdownOpen(false);
    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get("accessToken") || "",
      logoutAllDevices: false,
    });
  };

  return (
    <header
      // dùng fixed để ổn định khi chuyển route
      className="fixed top-0 z-40 w-full h-16 backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.72)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Container full-width */}
      <div
        className="mx-auto flex h-full w-full items-center gap-6"
        style={{ maxWidth: 1400, paddingLeft: "2rem", paddingRight: "1rem" }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-8 min-w-0">
          <Logo />
          {!isLecturer && (
            <nav className="hidden md:flex items-center gap-8">
              {navs.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="no-underline"
                  aria-current={item.isActive ? "page" : undefined}
                >
                  <span
                    className={
                      "text-base font-medium leading-none transition-colors visited:text-nav " +
                      (item.isActive
                        ? "text-nav-active"
                        : "text-nav hover:text-nav-active focus:text-nav-active active:text-nav-active")
                    }
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right */}
        <div className="ml-auto flex bg-slate-100 p-0 rounded-xl shadow-lg items-center gap-2">
          <NotificationsMenu
            open={notificationOpen}
            onOpenChange={(v) => {
              setNotificationOpen(v);
              if (v) setDropdownOpen(false);
            }}
            badgeCount={3}
          />
          {!isLecturer && (
            <UserMenu
              open={dropdownOpen}
              onOpenChange={(v) => {
                setDropdownOpen(v);
                if (v) setNotificationOpen(false);
              }}
              user={user ?? null}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
