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

// ✅ NEW: search bằng uniqueCode tách thành component riêng
import CourseCodeSearch from "./CourseCodeSearch";

const COOKIE_ACCESS_TOKEN_KEY = "accessToken";
const NOTI_CACHE_KEY_PREFIX = "student:notifs:v1:";

/** Chuẩn hóa format dữ liệu để UI render */
function normalizeNotification(raw: any): NotificationItem {
  const nowIso = new Date().toISOString();

  const id =
    raw?.id ||
    raw?.notificationId ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`);

  const readFlag =
    typeof raw?.read === "boolean"
      ? raw.read
      : typeof raw?.isRead === "boolean"
      ? raw.isRead
      : false;

  return {
    id,
    title: raw?.title || raw?.subject || "New notification",
    message: raw?.message || raw?.content || raw?.body || "",
    createdAt: raw?.createdAt || raw?.timestamp || nowIso,
    read: readFlag,
  };
}

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

  /** ====== memo callback cho hub ====== */
  const getTokenForHub = useCallback(() => {
    return getSavedAccessToken() || "";
  }, []);

  const handleHubNotification = useCallback((raw: any) => {
    const item = normalizeNotification(raw);
    setNotifications((prev) => [item, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  /** HUB */
  const { connect, disconnect, connected, connecting, lastError } =
    useNotificationHub({
      getAccessToken: getTokenForHub,
      onNotification: handleHubNotification,
    });

  /** ===============================
   * 1️⃣ Fetch lịch sử thông báo — CHỈ 1 LẦN / USER / SESSION
   * =============================== */
  useEffect(() => {
    if (!user?.id || historyLoaded) return;

    const cacheKey = `${NOTI_CACHE_KEY_PREFIX}${user.id}`;

    // 1) Thử đọc cache từ sessionStorage trước
    try {
      if (typeof window !== "undefined") {
        const cached = window.sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            notifications: NotificationItem[];
            unreadCount: number;
          };

          if (Array.isArray(parsed.notifications)) {
            setNotifications(parsed.notifications);
            setUnreadCount(parsed.unreadCount ?? 0);
            setHistoryLoaded(true);
            return; // đã có dữ liệu → khỏi gọi API
          }
        }
      }
    } catch {
      // ignore cache error
    }

    // 2) Không có cache → gọi API lần đầu, rồi cache lại
    (async () => {
      try {
        const list = await getNotifications({ take: 50 });
        if (!list) return;

        const normalized = list.map((n: any) => normalizeNotification(n));
        const unread = normalized.filter((n) => !n.read).length;

        setNotifications(normalized);
        setUnreadCount(unread);

        // Lưu cache cho lần F5 sau
        try {
          if (typeof window !== "undefined") {
            const payload = JSON.stringify({
              notifications: normalized,
              unreadCount: unread,
            });
            window.sessionStorage.setItem(cacheKey, payload);
          }
        } catch {
          // ignore cache error
        }

        setHistoryLoaded(true);
      } catch {
        // ignore API error, UI vẫn chạy bình thường
      }
    })();
  }, [user?.id, historyLoaded, getNotifications]);

  /** ===============================
   * 2️⃣ Kết nối hub — tránh spam connect/disconnect
   * =============================== */
  useEffect(() => {
    if (!user?.id) return;

    const token = getSavedAccessToken();
    if (!token) return;

    // connect 1 lần khi mount / userId thay đổi
    connect().catch(() => {
      // ignore connect error
    });

    // ✅ cleanup đúng: luôn disconnect khi unmount
    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  /** ===============================
   * 3️⃣ Logout
   * =============================== */
  const handleLogout = () => {
    setDropdownOpen(false);
    disconnect();

    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get(COOKIE_ACCESS_TOKEN_KEY) || "",
      logoutAllDevices: false,
    });
  };

  /** ===============================
   * 4️⃣ Khi mở menu notification → mark all as read
   * =============================== */
  const handleNotificationOpenChange = (v: boolean) => {
    setNotificationOpen(v);

    if (v && unreadCount > 0) {
      // cập nhật state + cache trong cùng 1 chỗ để tránh lệch dữ liệu
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));

        if (user?.id && typeof window !== "undefined") {
          const cacheKey = `${NOTI_CACHE_KEY_PREFIX}${user.id}`;
          try {
            const payload = JSON.stringify({
              notifications: updated,
              unreadCount: 0,
            });
            window.sessionStorage.setItem(cacheKey, payload);
          } catch {
            // ignore cache error
          }
        }

        return updated;
      });

      setUnreadCount(0);

      markAllNotificationsAsRead().catch(() => {
        // BE lỗi thì lần sau mở lại vẫn sẽ fetch/unread từ server
      });
    }

    if (v) setDropdownOpen(false);
  };

    return (
    <header
      className="fixed top-0 z-40 w-full h-16 backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.72)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="mx-auto flex h-full w-full items-center gap-6"
        style={{ maxWidth: 1400, paddingLeft: "2rem", paddingRight: "1rem" }}
      >
        {/* Logo */}
        <Logo />

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

        {/* 🔍 Search nằm ngay sau My Assignments */}
        <div className="ml-32">
          <CourseCodeSearch />
        </div>

        {/* RIGHT: push bell + user ra mép phải */}
        <div className="ml-auto flex items-center gap-3">
          {/* Notifications */}
          <div className="flex items-center bg-slate-100 p-1 mr-3 rounded-lg shadow-sm">
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

          {/* User menu */}
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
    </header>
  );

}
