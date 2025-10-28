"use client";

import { ChevronDown, CircleArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

type UserLite = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
} | null;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserLite;
  onLogout: () => void;
};

export default function UserMenu({ open, onOpenChange, user, onLogout }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    if (!user) return "ST";
    const f = user.firstName?.[0] ?? "";
    const l = user.lastName?.[0] ?? "";
    const res = `${f}${l}`.trim();
    return res || "ST";
  }, [user]);

  const fullName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Bob Wilson";

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
    <div ref={rootRef} className="relative cursor-pointer">
      <button
        className="flex items-center cursor-pointer gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 hover:shadow-md transition-all"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-black">{fullName}</p>
          <p className="text-xs text-black">{user?.role ?? "Student"}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50"
        >
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold cursor-text text-black">{fullName}</p>
            <p className="text-sm cursor-text text-black">
              {user?.email ?? "student.bob@university.edu"}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/student/profile/my-profile"
              className="flex w-full items-center gap-3 px-4 py-2 text-sm no-underline !text-black hover:!text-black focus:!text-black active:!text-black visited:!text-black hover:bg-gray-50 transition-colors"
              onClick={() => onOpenChange(false)}
              role="menuitem"
            >
              <div className="w-4 h-4 bg-gray-400 rounded-sm" />
              Profile
            </Link>
            <hr className="my-1 border-gray-200" />
            <button
              className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
              role="menuitem"
            >
              <CircleArrowOutUpRight className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
