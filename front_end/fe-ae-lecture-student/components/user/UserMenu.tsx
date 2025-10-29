"use client";

import { ChevronDown, CircleArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

type UserLite =
  | {
      id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
    }
  | null;

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
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--brand) 8%, #fff), color-mix(in oklab, var(--brand) 16%, #fff))",
          border: "1px solid var(--border)",
        }}
      >
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--brand), var(--nav-active))",
              color: "var(--white)",
            }}
          >
            {initials}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{
              background: "var(--accent)",
              borderColor: "var(--card)",
            }}
          />
        </div>

        <div className="hidden sm:block text-left min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
            {fullName}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {user?.role ?? "Student"}
          </p>
        </div>

        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-56 rounded-2xl shadow-xl py-2 z-50"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-semibold cursor-text" style={{ color: "var(--foreground)" }}>
              {fullName}
            </p>
            <p className="text-sm cursor-text" style={{ color: "var(--text-muted)" }}>
              {user?.email ?? "student.bob@university.edu"}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/student/profile/my-profile"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2 text-sm no-underline transition-colors rounded-md"
            >
              <span
                className="inline-block w-4 h-4 rounded-sm"
                style={{ background: "var(--brand)" }}
              />
              <span style={{ color: "var(--foreground)" }}>Profile</span>
            </Link>

            <hr className="my-1" style={{ borderColor: "var(--border)" }} />

            <button
              className="flex w-full items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors"
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
              role="menuitem"
              style={{ color: "var(--accent)" }}
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
