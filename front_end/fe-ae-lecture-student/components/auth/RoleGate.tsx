// components/auth/RoleGate.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mapRole, UserRole, ROLE_HOME, isAllowedAppRole } from "@/config/user-role";

type Props = { allow: UserRole[]; children: ReactNode };

export default function RoleGate({ allow, children }: Props) {
  const { user, isReady } = useAuth() as any;
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // LẤY ROLE LINH HOẠT: support user.role | user.roleName | user.role.name
  const rawRole =
    user?.role ?? user?.roleName ?? user?.role?.name;

  useEffect(() => {
    if (!isReady) return;

    if (!user) {
      const next = pathname + (search.toString() ? `?${search.toString()}` : "");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const role = mapRole(rawRole);

    if (!isAllowedAppRole(role)) {
      router.replace("/login");
      return;
    }

    if (!allow.includes(role!)) {
      router.replace(ROLE_HOME[role!]);
    }
  }, [isReady, user, rawRole, allow, router, pathname, search]);

  if (!isReady) return null;
  if (!user) return null;

  const role = mapRole(rawRole);
  if (!role || !allow.includes(role)) return null;

  return <>{children}</>;
}
