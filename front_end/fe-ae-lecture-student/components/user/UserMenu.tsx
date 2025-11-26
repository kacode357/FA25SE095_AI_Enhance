// components/user/UserMenu.tsx
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, CircleArrowOutUpRight } from "lucide-react";
import Link from "next/link";

import { loadDecodedUser } from "@/utils/secure-user";
import type { UserProfile } from "@/types/user/user.response";

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

const STORAGE_EVENT_NAME = "app:user-updated";

export default function UserMenu({ open, onOpenChange, user, onLogout }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [decodedUser, setDecodedUser] = useState<UserProfile | null>(null);

  // Load encoded user + listen event
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const u = await loadDecodedUser();
        if (!mounted) return;
        setDecodedUser(u);
      } catch {
        if (!mounted) return;
        setDecodedUser(null);
      }
    };

    fetchUser();

    const handleUserUpdated = () => {
      fetchUser();
    };

    if (typeof window !== "undefined") {
      window.addEventListener(STORAGE_EVENT_NAME, handleUserUpdated);
    }

    return () => {
      mounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(STORAGE_EVENT_NAME, handleUserUpdated);
      }
    };
  }, []);

  const effectiveFirstName = decodedUser?.firstName || user?.firstName || "";
  const effectiveLastName = decodedUser?.lastName || user?.lastName || "";
  const effectiveEmail = decodedUser?.email || user?.email || "";

  const subscriptionTier = decodedUser?.subscriptionTier?.trim() || "Basic";

  const initials = useMemo(() => {
    const f = effectiveFirstName?.trim();
    const l = effectiveLastName?.trim();

    if (!f && !l) return "ST";
    if (f && !l) return f[0]?.toUpperCase() || "U";
    if (!f && l) return l[0]?.toUpperCase() || "U";

    return `${f[0]?.toUpperCase() ?? ""}${l[0]?.toUpperCase() ?? ""}` || "U";
  }, [effectiveFirstName, effectiveLastName]);

  const fullName = useMemo(() => {
    const name = `${effectiveFirstName} ${effectiveLastName}`.trim();
    return name || "Student";
  }, [effectiveFirstName, effectiveLastName]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onOpenChange]);

  const handleToggle = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onOpenChange(!open);
  };

  const handleLogout = () => {
    onOpenChange(false);
    onLogout();
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-full border border-[rgba(129,140,248,0.35)] bg-white px-3 py-1.5 text-sm shadow-sm transition hover:border-brand/60 hover:bg-slate-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold uppercase text-brand">
          {initials}
        </div>
        <div className="hidden text-left text-xs sm:block">
          <div className="max-w-[140px] truncate font-medium text-nav">
            {fullName}
          </div>
          <div className="max-w-[160px] truncate text-[11px] text-muted-foreground">
            {effectiveEmail || "No email"}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: -4, scale: 0.98 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -4, scale: 0.98 }
            }
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[rgba(129,140,248,0.35)] bg-white/95 p-3 text-sm shadow-lg backdrop-blur"
          >
            {/* Current plan */}
            <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground">
                  Current plan
                </span>
                <span className="text-sm font-semibold text-nav">
                  {subscriptionTier}
                </span>
              </div>
              <Link
                href="/student/my-subscription"
                className="inline-flex items-center gap-1 rounded-full border border-brand/40 px-2 py-1 text-[11px] font-medium text-brand hover:border-brand hover:bg-brand/5"
                onClick={() => onOpenChange(false)}
              >
                Manage
                <CircleArrowOutUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="my-2 h-px bg-slate-100" />

            {/* Actions */}
            <div className="space-y-1">
              <Link
                href="/student/profile"
                className="block rounded-md px-2 py-1.5 text-xs font-medium text-nav hover:bg-slate-50"
                onClick={() => onOpenChange(false)}
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
