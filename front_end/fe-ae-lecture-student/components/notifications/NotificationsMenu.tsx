"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  badgeCount?: number;
};

export default function NotificationsMenu({
  open,
  onOpenChange,
  badgeCount = 3,
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

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={toggle}
        className="relative p-2 rounded-lg cursor-pointer transition-colors text-nav hover:bg-[var(--focus-ring)] focus:bg-[var(--focus-ring)] focus:outline-none"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="w-5 h-5" />
        {badgeCount > 0 && (
          <span
            // Đã fix: Tăng kích thước và điều chỉnh vị trí
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
              {badgeCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl py-2 z-50"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          <div
            className="px-4 py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
              Notifications
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-3 transition-colors"
              onClick={() => onOpenChange(false)}
              role="menuitem"
            >
              <div className="rounded-md hover:bg-[var(--focus-ring)] p-2 -m-2">
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  You have new assignments to review
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  2 minutes ago
                </p>
              </div>
            </button>

            <button
              className="w-full text-left px-4 py-3 transition-colors"
              onClick={() => onOpenChange(false)}
              role="menuitem"
            >
              <div className="rounded-md hover:bg-[var(--focus-ring)] p-2 -m-2">
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  Course “CS101” has a new announcement
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  5 minutes ago
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}