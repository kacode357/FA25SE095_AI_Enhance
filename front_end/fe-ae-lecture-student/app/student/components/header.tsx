// app/student/components/header.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useNotificationHub } from "@/hooks/hubNotification/useNotificationHub";
import { useGetNotifications } from "@/hooks/notifications/useGetNotifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/notifications/useMarkAllNotificationsAsRead";

import { getSavedAccessToken } from "@/utils/auth/access-token";

import Logo from "@/components/logo/Logo";
import UserMenu from "@/components/user/UserMenu";
import NotificationsMenu, {
  NotificationItem,
} from "@/components/notifications/NotificationsMenu";

import { useStudentNav } from "./nav-items";
import CourseCodeSearch from "./CourseCodeSearch";

const COOKIE_ACCESS_TOKEN_KEY = "accessToken";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useLogout();
  const navs = useStudentNav();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const { getNotifications } = useGetNotifications();
  const { markAllNotificationsAsRead } = useMarkAllNotificationsAsRead();

  const getTokenForHub = useCallback(() => {
    return getSavedAccessToken() || "";
  }, []);

  const handleHubNotification = useCallback((raw: any) => {
    const incoming: NotificationItem = {
      id: raw.id,
      title: raw.title,
      content: raw.content,
      isRead: raw.isRead,
      createdAt: raw.createdAt,
    };

    setNotifications((prev) => [incoming, ...prev]);

    if (!incoming.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const { connect, disconnect, connected, connecting, lastError } =
    useNotificationHub({
      getAccessToken: getTokenForHub,
      onNotification: handleHubNotification,
    });

  useEffect(() => {
    if (!user?.id || historyLoaded) return;

    (async () => {
      try {
        const list = await getNotifications({ take: 50 });
        if (!list || !Array.isArray(list)) return;

        const normalized: NotificationItem[] = list.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          isRead: n.isRead,
          createdAt: n.createdAt,
        }));

        setNotifications(normalized);
        setUnreadCount(normalized.filter((n) => !n.isRead).length);
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, [user?.id, historyLoaded, getNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const token = getSavedAccessToken();
    if (!token) return;

    connect().catch(() => {
      // ignore
    });

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  const handleLogout = () => {
    setDropdownOpen(false);
    disconnect();

    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get(COOKIE_ACCESS_TOKEN_KEY) || "",
      logoutAllDevices: false,
    });
  };

  const handleNotificationOpenChange = (v: boolean) => {
    setNotificationOpen(v);

    if (v && unreadCount > 0) {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
      setUnreadCount(0);

      markAllNotificationsAsRead().catch(() => {
        // ignore
      });
    }

    if (v) setDropdownOpen(false);
  };

  // 🔹 Active nav cho fallback select
  const activeNav = navs.find((n) => (n as any).isActive);

  return (
    <header
      className="student-header fixed top-0 z-50 w-full h-16"
      data-tour="header-shell"
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-4 px-6">
        {/* LEFT: Logo + Nav */}
        <div
          className="flex min-w-0 flex-1 items-center gap-4"
          data-tour="header-main-nav"
        >
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Desktop nav (giữ nguyên, dùng cho màn rộng) */}
          <nav className="hidden md:flex items-center gap-6 overflow-x-auto">
            {navs.map((item: any) => (
              <Link
                key={item.href}
                href={item.href}
                className="no-underline whitespace-nowrap"
                aria-current={item.isActive ? "page" : undefined}
              >
                <span
                  className={`text-sm md:text-base font-medium leading-none transition-colors visited:text-nav ${
                    item.isActive
                      ? "text-nav-active"
                      : "text-nav hover:text-nav-active focus:text-nav-active active:text-nav-active"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* 🔥 Fallback nav (select) cho khi zoom to / màn nhỏ */}
          <div className="md:hidden">
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
              value={activeNav?.href ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value) router.push(value);
              }}
            >
              <option value="" disabled>
                Navigate...
              </option>
              {navs.map((item: any) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT: Search + Notifications + User */}
        <div
          className="flex items-center gap-4 flex-shrink-0"
          data-tour="header-actions"
        >
          {/* Search by code */}
          <div className="hidden sm:block">
            <CourseCodeSearch />
          </div>

          <div className="flex items-center gap-3">
            <NotificationsMenu
              open={notificationOpen}
              onOpenChange={handleNotificationOpenChange}
              badgeCount={unreadCount}
              notifications={notifications}
              connected={connected}
              connecting={connecting}
              lastError={lastError ?? undefined}
            />

            <UserMenu
              open={dropdownOpen}
              onOpenChange={(v) => {
                setDropdownOpen(v);
                if (v) setNotificationOpen(false);
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
