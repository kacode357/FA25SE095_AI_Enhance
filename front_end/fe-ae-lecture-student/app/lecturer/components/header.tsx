// app/student/components/header.tsx
"use client";

import { useEffect, useState } from "react";

import UserMenu from "@/components/user/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useNotificationHub } from "@/hooks/hubnotification/useNotificationHub";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "@/components/logo/Logo";
import NotificationsMenu, {
  NotificationItem,
} from "@/components/notifications/NotificationsMenu";
import { getSavedAccessToken } from "@/utils/auth/access-token";

// ✅ hooks notifications
import { useGetNotifications } from "@/hooks/notifications/useGetNotifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/notifications/useMarkAllNotificationsAsRead";

const COOKIE_ACCESS_TOKEN_KEY = "accessToken";

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
    content: raw?.content || raw?.message || raw?.body || "",
    createdAt: raw?.createdAt || raw?.timestamp || nowIso,
    isRead: readFlag,
  };
}

export default function Header() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();
  const { logout } = useLogout();

  const { getNotifications } = useGetNotifications();
  const { markAllNotificationsAsRead } = useMarkAllNotificationsAsRead();

  const {
    connect,
    disconnect,
    connected,
    connecting,
    lastError,
  } = useNotificationHub({
    // Wrap to always return a string (never null) to satisfy hook signature
    getAccessToken: () => getSavedAccessToken() || "",
    onNotification: (raw) => {
      const item = normalizeNotification(raw);
      setNotifications((prev) => [item, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    onError: (msg) => {
      console.warn("[Header][NotificationHub] onError:", msg);
    },
  });

  // ✅ Lấy lịch sử thông báo từ API khi có user
  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const list = await getNotifications({ take: 50 });
        if (!list) return;

        setNotifications(list.map((n) => normalizeNotification(n)));

        const unread = list.filter((n: any) => {
          if (typeof n.isRead === "boolean") return !n.isRead;
          if (typeof n.read === "boolean") return !n.read;
          return false;
        }).length;

        setUnreadCount(unread);
      } catch (err) {
        console.warn("[Header][Notifications] fetch history error:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Auto connect khi có user + token
  useEffect(() => {
    if (!user?.id) return;

    const token = getSavedAccessToken();
    console.log(
      "[Header][NotificationHub] token from storage:",
      token ? token.slice(0, 25) + "..." : "(EMPTY)"
    );
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        console.log("[Header][NotificationHub] calling connect()...");
        await connect();
        if (!cancelled) {
          console.log("[Header][NotificationHub] connect() resolved");
        }
      } catch (e) {
        console.warn("[Header][NotificationHub] connect exception:", e);
      }
    })();

    return () => {
      cancelled = true;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ✅ Khi mở dropdown notif: mark-all-as-read (gọi API + update local)
  const handleNotificationOpenChange = (v: boolean) => {
    setNotificationOpen(v);
    if (v) {
      // Đóng menu user nếu đang mở
      setDropdownOpen(false);

      if (unreadCount > 0) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);

        // fire-and-forget
        markAllNotificationsAsRead().catch((err) => {
          console.warn(
            "[Header][Notifications] markAllNotificationsAsRead error:",
            err
          );
        });
      }
    }
  };

  return (
    <header
      className="fixed top-0 z-40 w-full h-16 backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.72)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Container full-width */}
      <div
        className="mx-auto relative flex h-full w-full items-center gap-0"
        style={{ maxWidth: 1400, paddingLeft: "2rem", paddingRight: "1rem" }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-10 min-w-0">
          <Logo />

          <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-10">
            <Link
              href="/lecturer/course"
              className={`text-sm font-medium ${pathname?.startsWith("/lecturer/course") ? "!text-brand !text-[16px]" : "!text-[#000D83] hover:!text-gray-900"}`}
            >
              Announment
            </Link>

            <Link
              href="/lecturer/course"
              className={`text-sm font-medium ${pathname?.startsWith("/lecturer/course") ? "!text-brand !text-[16px]" : "!text-[#000D83] hover:!text-gray-900"}`}
            >
              My Course
            </Link>

            <Link
              href="/lecturer/manage-courses"
              className={`text-sm font-medium ${pathname?.startsWith("/lecturer/manage-courses") ? "!text-brand !text-[16px]" : "!text-[#000D83] hover:!text-gray-900"}`}
            >
              Manager Course
            </Link>

            <Link
              href="/lecturer/dashboard"
              className={`text-sm font-medium ${pathname?.startsWith("/lecturer/dashboard") ? "!text-brand !text-[16px]" : "!text-[#000D83] hover:!text-gray-900"}`}
            >
              Dashboard
            </Link>

            <Link
              href="/lecturer/messages"
              className={`text-sm font-medium ${pathname?.startsWith("/lecturer/messages") ? "!text-brand !text-[16px]" : "!text-[#000D83] hover:!text-gray-900"}`}
            >
              Chat
            </Link>
          </nav>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          {/* Bell / notifications box */}
          <div className="flex bg-slate-100 p-0 rounded-xl shadow-lg items-center gap-2">
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

          {/* User menu separated from bell */}
          <div className="ml-2 rounded-full">
            <UserMenu
              open={dropdownOpen}
              onOpenChange={(v: boolean) => setDropdownOpen(v)}
              onLogout={() => {
                setDropdownOpen(false);
                logout();
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
