"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, CircleArrowOutUpRight, LogOut, ShieldUser } from "lucide-react";
import Link from "next/link";
import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/types/user/user.response";
import { loadDecodedUser } from "@/utils/secure-user";
import { getUserShortName } from "@/utils/user/display-name";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLogout: () => void;
};

const STORAGE_EVENT_NAME = "app:user-updated";

export default function UserMenu({ open, onOpenChange, onLogout }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [decodedUser, setDecodedUser] = useState<UserProfile | null>(null);

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

  // Only decodedUser
  const fullName = decodedUser?.fullName || "Student";
  const email = decodedUser?.email || "";
  const profilePictureUrl = decodedUser?.profilePictureUrl || "";
  const subscriptionTier = decodedUser?.subscriptionTier || "Basic";

  // Role detection
  const isLecturer = (() => {
    if (!decodedUser) return false;
    const single = (decodedUser as any).role;
    if (typeof single === "string") {
      return single.toLowerCase() === "lecturer";
    }
    const many = (decodedUser as any).roles;
    if (Array.isArray(many)) {
      return many.some((r) => String(r).toLowerCase() === "lecturer");
    }
    return false;
  })();

  const displayName = fullName || "Student";
  const shortName = getUserShortName(fullName);

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

  const handleLogoutClick = () => {
    onOpenChange(false);
    onLogout();
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="student-header-button cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm"
      >
        <Avatar className="h-8 w-8">
          {profilePictureUrl ? (
            <AvatarImage src={profilePictureUrl} alt={displayName} />
          ) : (
            <AvatarFallback className="text-[11px] font-semibold uppercase text-brand">
              {shortName}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="hidden text-left text-xs sm:block">
          <div className="max-w-[140px] truncate font-medium text-nav">
            {displayName}
          </div>
          <div className="max-w-[160px] truncate text-[11px] text-muted-foreground">
            {email || "No email"}
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
            className="student-popover absolute right-0 z-50 mt-2 w-56 p-3 text-sm backdrop-blur"
          >
            {/* Current plan (hidden for lecturers) */}
            {!isLecturer && (
              <div className="student-popover-section-muted mb-3 flex items-center justify-between gap-2 px-3 py-2 text-xs">
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
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium text-brand hover:bg-brand/5"
                  style={{ borderColor: "var(--border)" }}
                  onClick={() => onOpenChange(false)}
                >
                  Manage
                  <CircleArrowOutUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            <div className="my-2 h-px border-t student-popover-divider" />

            {/* Actions */}
            <div className="space-y-1">
              <Link
                href={
                  isLecturer
                    ? "/lecturer/profile/my-profile"
                    : "/student/profile"
                }
                className="block rounded-md px-2 py-1.5 text-xs font-medium text-nav hover:bg-slate-50"
                onClick={() => onOpenChange(false)}
              >
                <span className="flex gap-2"><ShieldUser className="size-4" />Profile</span>
              </Link>

              {/* --- MỚI THÊM: Payment History (Chỉ hiện cho Student) --- */}
              {!isLecturer && (
                <Link
                  href="/student/payment-history"
                  className="block rounded-md px-2 py-1.5 text-xs font-medium text-nav hover:bg-slate-50"
                  onClick={() => onOpenChange(false)}
                >
                  Payment History
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogoutClick}
                className="mt-1 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <span className="flex gap-2"><LogOut className="size-4" />Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}