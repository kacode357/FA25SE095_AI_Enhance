// app/student/components/header.tsx
"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const COOKIE_ACCESS_TOKEN_KEY = "accessToken";

/** Chuẩn hóa format dữ liệu để UI render */
function normalizeNotification(raw: any): NotificationItem {
  const nowIso = new Date().toISOString();

  const id =
    raw?.id ||
    raw?.notificationId ||
    (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

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

  /** HUB */
  const {
    connect,
    disconnect,
    connected,
    connecting,
    lastError,
  } = useNotificationHub({
    getAccessToken: () => getSavedAccessToken() || "",
    onNotification: (raw) => {
      const item = normalizeNotification(raw);
      setNotifications((prev) => [item, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
  });

  /** ===============================
   * 1️⃣ Fetch lịch sử thông báo — CHỈ 1 LẦN
   * =============================== */
  useEffect(() => {
    if (!user?.id) return;
    if (historyLoaded) return; // đã load rồi → bỏ
    if (connected) return;     // hub đã kết nối → không fetch nữa

    (async () => {
      try {
        const list = await getNotifications({ take: 50 });
        if (!list) return;

        const normalized = list.map((n) => normalizeNotification(n));
        setNotifications(normalized);

        const unread = normalized.filter((n) => !n.read).length;
        setUnreadCount(unread);

        setHistoryLoaded(true); // khóa lại
      } catch (err) {
        console.warn("[Header] fetch history error:", err);
      }
    })();
  }, [user?.id, connected, historyLoaded]);

  /** ===============================
   * 2️⃣ Kết nối hub
   * =============================== */
  useEffect(() => {
    if (!user?.id) return;

    const token = getSavedAccessToken();
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        await connect();
        if (!cancelled) {
          console.log("[NotificationHub] Connected.");
        }
      } catch (e) {
        console.warn("[NotificationHub] connect failed:", e);
      }
    })();

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [user?.id]);

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
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      markAllNotificationsAsRead().catch((err) =>
        console.warn("[markAll] error:", err)
      );
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
        {/* LEFT */}
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
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          {/* Separate small container for notifications */}
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

          {/* User menu in its own pill */}
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
