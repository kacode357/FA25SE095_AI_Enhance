// components/notifications/NotificationsMenu.tsx
"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getNotificationHref } from "./notification-routes-students";

export type NotificationItem = {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  metadataJson?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  badgeCount?: number;
  notifications?: NotificationItem[];

  connected?: boolean;
  connecting?: boolean;
  lastError?: string;
};

const NOTI_SOUND_KEY = "student:noti:soundEnabled";
const NOTI_SOUND_EVENT = "student:noti:sound-changed";

function formatTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function NotificationsMenu({
  open,
  onOpenChange,
  badgeCount,
  notifications = [],
  connected,
  connecting,
  lastError,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // 🔊 Âm thanh thông báo
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevCountRef = useRef<number | null>(null);

  // setting bật/tắt tiếng
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load setting từ localStorage + listen custom event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(NOTI_SOUND_KEY);
    if (raw === "off") {
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
    }

    const handleSettingChanged = (e: Event) => {
      const ce = e as CustomEvent<{ enabled: boolean }>;
      if (typeof ce.detail?.enabled === "boolean") {
        setSoundEnabled(ce.detail.enabled);
      }
    };

    window.addEventListener(NOTI_SOUND_EVENT, handleSettingChanged);
    return () => {
      window.removeEventListener(NOTI_SOUND_EVENT, handleSettingChanged);
    };
  }, []);

  // Khởi tạo audio 1 lần
  useEffect(() => {
    if (typeof window === "undefined") return;

    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.load();
  }, []);

  // Mỗi lần số lượng notifications tăng -> phát âm thanh
  useEffect(() => {
    const currentCount = notifications.length;

    // Bỏ qua lần mount đầu tiên
    if (prevCountRef.current === null) {
      prevCountRef.current = currentCount;
      return;
    }

    // Nếu user tắt tiếng -> không play
    if (!soundEnabled) {
      prevCountRef.current = currentCount;
      return;
    }

    if (currentCount > prevCountRef.current) {
      // có noti mới
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch(() => {
            // có thể bị chặn autoplay nếu user chưa tương tác, bỏ qua lỗi
          });
      }
    }

    prevCountRef.current = currentCount;
  }, [notifications.length, notifications, soundEnabled]);

  const toggle = () => onOpenChange(!open);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target)) onOpenChange(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onOpenChange]);

  const effectiveBadge =
    typeof badgeCount === "number"
      ? badgeCount
      : notifications.filter((n) => !n.isRead).length;

  let statusText = "Disconnected";
  let statusClass = "student-noti-status student-noti-status--disconnected";

  if (connecting) {
    statusText = "Connecting...";
    statusClass = "student-noti-status student-noti-status--connecting";
  } else if (connected) {
    statusText = "Connected";
    statusClass = "student-noti-status student-noti-status--connected";
  } else if (lastError) {
    statusText = "Error";
    statusClass = "student-noti-status student-noti-status--error";
  }

  const handleNotificationClick = (item: NotificationItem) => {
    onOpenChange(false);

    const href = getNotificationHref(item.metadataJson);

    if (href) {
      router.push(href);
    } else {
      router.push("/student/notifications");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Nút chuông */}
      <button
        onClick={toggle}
        className="student-header-button student-header-icon-btn relative flex items-center justify-center cursor-pointer focus:outline-none"
        aria-label="Notifications"
        aria-expanded={open ? "true" : "false"}
        aria-haspopup="menu"
        style={{ padding: "0.6rem" }}
      >
        <Bell className="w-5 h-5" />
        {effectiveBadge > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent)",
              border: "2px solid var(--card)",
            }}
          >
            <span
              className="text-[10px] font-bold leading-none"
              style={{ color: "var(--white)" }}
            >
              {effectiveBadge}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="student-popover absolute right-0 top-12 w-80 py-2 z-50"
        >
          {/* Header + status */}
          <div className="px-4 py-2 flex items-center justify-between gap-2 border-b student-popover-divider">
            <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
              Notifications
            </h3>
            <span className={statusClass}>{statusText}</span>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm student-text-muted">
                You&apos;re all caught up. No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  title="Notification"
                  type="button"
                  className="w-full text-left px-4 py-3 transition-colors"
                  onClick={() => handleNotificationClick(item)}
                  role="menuitem"
                >
                  <div className="rounded-md hover:bg-[var(--focus-ring)] p-2 -m-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.title || "New notification"}
                    </p>
                    {item.content && (
                      <p className="text-xs mt-1 student-text-muted">
                        {item.content}
                      </p>
                    )}
                    {item.createdAt && (
                      <p className="text-[11px] mt-1 text-right student-text-muted">
                        {formatTime(item.createdAt)}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 flex justify-end border-t student-popover-divider">
            <Link
              href="/student/notifications"
              className="text-xs font-medium"
              style={{ color: "var(--accent)" }}
              onClick={() => onOpenChange(false)}
            >
              View all notifications
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
