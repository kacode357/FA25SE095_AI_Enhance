// components/auth/RoleGate.tsx
"use client";

import { ReactNode, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mapRole, UserRole } from "@/config/user-role";

type Props = {
  allow: UserRole[];        // các role được phép vào
  children: ReactNode;
  fallback?: ReactNode;     // optional: loader UI
};

export default function RoleGate({ allow, children, fallback = null }: Props) {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // One-shot: nếu vừa login xong thì không redirect sớm trong lần render đầu
  const skipRedirectOnceRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("just_logged_in") === "1") {
      skipRedirectOnceRef.current = true;
      sessionStorage.removeItem("just_logged_in");
    }
  }, []);

  const role = useMemo(() => {
    const raw = (user as any)?.role ?? (user as any)?.roleName ?? (user as any)?.role?.name;
    return mapRole(raw);
  }, [user]);

  useEffect(() => {
    if (!isReady) return; // CHỜ HẲN isReady

    // Chưa có user hoặc không map được role -> login
    if (!user || role == null) {
      if (skipRedirectOnceRef.current) return; // cho qua tick đầu sau login
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Có user nhưng role không hợp lệ với trang này -> login
    if (!allow.includes(role)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, user, role, allow, router, pathname]);

  // UI: khi chưa ready thì đừng render children để tránh flicker
  if (!isReady) return <>{fallback}</>;
  if (!user || role == null) return null;
  if (!allow.includes(role)) return null;

  return <>{children}</>;
}
