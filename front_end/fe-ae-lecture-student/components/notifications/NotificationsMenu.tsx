"use client";

import { useEffect, useRef } from "react";
import { Bell } from "lucide-react";

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
        className="relative p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-3 h-3 px-0.5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-bold leading-none">
              {badgeCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="font-semibold text-black">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onOpenChange(false)}
              role="menuitem"
            >
              <p className="text-sm text-black">
                You have new assignments to review
              </p>
              <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
            </button>
            <button
              className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onOpenChange(false)}
              role="menuitem"
            >
              <p className="text-sm text-black">
                Course “CS101” has a new announcement
              </p>
              <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
