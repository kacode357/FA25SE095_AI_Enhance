// app/student/components/header.tsx

"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useNotificationHub } from "@/hooks/hubnotification/useNotificationHub";

import Logo from "@/components/logo/Logo";
import NotificationsMenu, {
  NotificationItem,
} from "@/components/notifications/NotificationsMenu";
import UserMenu from "@/components/user/UserMenu";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { useStudentNav } from "./nav-items";

import { useGetNotifications } from "@/hooks/notifications/useGetNotifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/notifications/useMarkAllNotificationsAsRead";

import CourseCodeSearch from "./CourseCodeSearch";

const COOKIE_ACCESS_TOKEN_KEY = "accessToken";

export default function Header() {
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

  /** Lấy token cho hub */
  const getTokenForHub = useCallback(() => {
    return getSavedAccessToken() || "";
  }, []);

  /** Nhận noti real-time từ Hub */
  const handleHubNotification = useCallback((raw: any) => {
    // map raw BE -> UI type
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

  /** HUB connection */
  const { connect, disconnect, connected, connecting, lastError } =
    useNotificationHub({
      getAccessToken: getTokenForHub,
      onNotification: handleHubNotification,
    });

  /** Load lịch sử notifications lần đầu */
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

  /** Kết nối hub khi có user + token */
  useEffect(() => {
    if (!user?.id) return;

    const token = getSavedAccessToken();
    if (!token) return;

    connect().catch(() => {
      // ignore, UI đã show status qua lastError
    });

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  /** Logout */
  const handleLogout = () => {
    setDropdownOpen(false);
    disconnect();

    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get(COOKIE_ACCESS_TOKEN_KEY) || "",
      logoutAllDevices: false,
    });
  };

  /** Mở menu notifications => mark all as read */
  const handleNotificationOpenChange = (v: boolean) => {
    setNotificationOpen(v);

    if (v && unreadCount > 0) {
      // update UI
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
      setUnreadCount(0);

      // call BE
      markAllNotificationsAsRead().catch(() => {
        // BE lỗi thì lần sau list từ server vẫn phản ánh đúng
      });
    }

    if (v) setDropdownOpen(false);
  };

  return (
    <header
      className="fixed top-0 z-50 w-full h-16 backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.72)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Wrapper căn giữa header */}
      <div
        className="relative mx-auto flex h-full w-full items-center gap-6"
        style={{ paddingLeft: "2rem", paddingRight: "1rem" }}
      >
        {/* Logo + Nav + Search + Right actions */}
        <div className="flex h-full w-full items-center gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="no-underline"
                aria-current={item.isActive ? "page" : undefined}
              >
                <span
                  className={`text-base font-medium leading-none transition-colors visited:text-nav ${
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

          {/* 🔍 Search course by unique code */}
          <div className="relative ml-32">
            <CourseCodeSearch />
          </div>

          {/* RIGHT: Notifications + User menu */}
          <div className="ml-auto flex items-center gap-3">
            {/* CHUÔNG: bỏ bg/sadow wrapper, chỉ để component */}
            <div className="flex items-center mr-3">
              <NotificationsMenu
                open={notificationOpen}
                onOpenChange={handleNotificationOpenChange}
                badgeCount={unreadCount}
                notifications={notifications}
                connected={connected}
                connecting={connecting}
                lastError={lastError ?? undefined}
              />
            </div>

            {/* User menu vẫn giữ card sáng */}
            <div className="flex items-center border-slate-100 bg-slate-100 rounded-xl shadow-lg">
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
        </div>
      </div>
    </header>
  );
}
