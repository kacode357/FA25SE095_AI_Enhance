// components/auth/RoleGate.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mapRole, UserRole, ROLE_HOME, isAllowedAppRole } from "@/config/user-role";

type Props = { allow: UserRole[]; children: ReactNode };

export default function RoleGate({ allow, children }: Props) {
  const { user, isReady } = useAuth() as any;
  const router = useRouter();

  const rawRole = user?.role ?? user?.roleName ?? user?.role?.name;
  const redirectedRef = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (redirectedRef.current) return;
    if (!isReady) return;

    // Nếu đã có user → check role & allow
    if (user) {
      const role = mapRole(rawRole);
      // đã xác thực xong → dọn cờ nếu còn
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("just_logged_in");
      }

      if (!role || !isAllowedAppRole(role)) {
        redirectedRef.current = true;
        router.replace("/login");
        return;
      }
      if (!allow.includes(role)) {
        redirectedRef.current = true;
        router.replace(ROLE_HOME[role]);
        return;
      }
      // ok được xem
      return;
    }

    // === user == null tại thời điểm isReady ===
    // Kiểm tra xem vừa login không (one-shot grace)
    const justLoggedIn =
      typeof window !== "undefined" &&
      sessionStorage.getItem("just_logged_in") === "1";

    if (justLoggedIn) {
      // KHÔNG redirect ngay; chờ 2s cho AuthContext set user
      if (!fallbackTimerRef.current) {
        fallbackTimerRef.current = setTimeout(() => {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            // hết thời gian mà vẫn chưa có user → về /login
            router.replace("/login");
            // dọn cờ để không kẹt
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("just_logged_in");
            }
          }
        }, 2000);
      }
      return;
    }

    // Không có cờ → chưa login/invalid token → về /login
    redirectedRef.current = true;
    router.replace("/login");
  }, [isReady, user, rawRole, allow, router]);

  useEffect(() => {
    // cleanup timer khi unmount
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  if (!isReady) return null;
  if (!user) return null;

  const role = mapRole(rawRole);
  if (!role || !allow.includes(role)) return null;

  return <>{children}</>;
}
