// components/notifications/NotificationsMenu.tsx
"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  createdAt?: string;
  read?: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  badgeCount?: number;
  notifications?: NotificationItem[];

  // trạng thái hub (auto)
  connected?: boolean;
  connecting?: boolean;
  lastError?: string;
};

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
  const toggle = () => onOpenChange(!open);

  // Outside click + ESC
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
      : notifications.filter((n) => !n.read).length;

  // status hub
  let statusText = "Disconnected";
  let statusClass = "text-[11px] mt-0.5 text-red-500";

  if (connecting) {
    statusText = "Connecting...";
    statusClass = "text-[11px] mt-0.5 text-blue-600";
  } else if (connected) {
    statusText = "Connected";
    statusClass = "text-[11px] mt-0.5 text-emerald-600";
  } else if (lastError) {
    statusText = "Error";
    statusClass = "text-[11px] mt-0.5 text-red-500";
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={toggle}
        className="relative p-1.5 rounded-lg cursor-pointer transition-colors text-nav hover:bg-[var(--focus-ring)] focus:bg-[var(--focus-ring)] focus:outline-none"
        aria-label="Notifications"
        aria-expanded={open ? "true" : "false"}
        aria-haspopup="menu"
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

      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute right-0 top-12 w-80 rounded-2xl shadow-lg py-2 z-50"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(15,23,42,0.06)",
            color: "var(--foreground)",
          }}
        >
          {/* Header + status */}
          <div
            className="px-4 py-2 flex items-center justify-between gap-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
              Notifications
            </h3>
            <span className={statusClass}>{statusText}</span>
          </div>

          {/* List notifications */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div
                className="px-4 py-3 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                You&apos;re all caught up. No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  title="Menu"
                  type="button"
                  className="w-full text-left px-4 py-3 transition-colors"
                  onClick={() => onOpenChange(false)}
                  role="menuitem"
                >
                  <div className="rounded-md hover:bg-[var(--focus-ring)] p-2 -m-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.title || "New notification"}
                    </p>
                    {item.message && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.message}
                      </p>
                    )}
                    {item.createdAt && (
                      // Tao thêm text-right vào đây 👇
                      <p
                        className="text-[11px] mt-1 text-right"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatTime(item.createdAt)}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer: View all */}
          <div
            className="px-4 py-2 flex justify-end"
            style={{ borderTop: "1px solid var(--border)" }}
          >
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