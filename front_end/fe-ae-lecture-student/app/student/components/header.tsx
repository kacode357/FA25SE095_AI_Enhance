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
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.72)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Container full-width, padding 2 bên nhỏ để sát phải hơn */}
      <div
        className="mx-auto flex h-16 w-full items-center gap-6"
        style={{ maxWidth: 1400, paddingLeft: "2rem", paddingRight: "1rem" }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-8 min-w-0">
          <Logo />

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
                    "text-base font-semibold leading-none transition-colors visited:text-nav " +
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
        </div>

        {/* Right: push to far right */}
        <div className="ml-auto flex items-center gap-2">
          <NotificationsMenu
            open={notificationOpen}
            onOpenChange={(v) => {
              setNotificationOpen(v);
              if (v) setDropdownOpen(false);
            }}
            badgeCount={3}
          />

          <UserMenu
            open={dropdownOpen}
            onOpenChange={(v) => {
              setDropdownOpen(v);
              if (v) setNotificationOpen(false);
            }}
            user={user ?? null}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
