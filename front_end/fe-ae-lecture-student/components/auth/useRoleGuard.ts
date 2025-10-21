// components/auth/useRoleGuard.ts
"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, homeOf } from "@/config/user-role";

function mapRoleFromProfile(user: any): UserRole | null {
  const raw = user?.role ?? user?.roleName ?? user?.role?.name;
  if (typeof raw === "number") return raw as UserRole;
  const s = String(raw ?? "").trim().toLowerCase();
  if (/^\d+$/.test(s)) { const n = Number(s); return Number.isInteger(n) ? (n as UserRole) : null; }
  if (s === "admin") return UserRole.Admin;
  if (s === "staff") return UserRole.Staff;
  if (s === "lecturer") return UserRole.Lecturer;
  if (s === "student") return UserRole.Student;
  return null;
}

export function useRoleGuard(required: UserRole) {
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // mount + đọc cookie chỉ ở client
  useLayoutEffect(() => {
    setMounted(true);
    try {
      const cookie = document.cookie || "";
      setHasToken(/(?:^|;\s*)accessToken=/.test(cookie));
    } catch {
      setHasToken(false);
    }
  }, []);

  const currentRole = useMemo(() => (user ? mapRoleFromProfile(user) : null), [user]);

  // Redirect cứng, chạy sớm (layout effect)
  useLayoutEffect(() => {
    if (!mounted) return;

    if (hasToken === false) {
      window.location.replace("/login");
      return;
    }
    if (currentRole != null && currentRole !== required) {
      window.location.replace(homeOf(currentRole));
    }
  }, [mounted, hasToken, currentRole, required]);

  const allowed =
    mounted &&
    hasToken === true &&
    currentRole != null &&
    currentRole === required;

  return { allowed };
}
