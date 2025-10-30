// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user/user.response";
import { UserService } from "@/services/user.services";
import { mapRole } from "@/config/user-role";
import type { ApiResponse } from "@/types/auth/auth.response";

type AuthContextType = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const authPages = new Set<string>([
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
    ]);

    // Trang auth → không fetch profile để tránh vòng lặp 401 interceptor
    if (authPages.has(pathname)) {
      setUser(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        // ✅ Lấy đúng payload thật: resp.data (UserProfile)
        const resp: ApiResponse<UserProfile> = await UserService.getProfile();
        if (!mounted) return;

        const profile = resp.data; // <-- đây mới là UserProfile
        setUser(profile);
        setLoading(false);

        // Điều hướng theo role
        const roleLower = (profile?.role ?? "").toLowerCase();
        // Nếu mày muốn chắc role hợp lệ theo mapRole thì giữ dòng dưới,
        // còn không có thể chỉ check roleLower === "staff"
        const isStaff = mapRole(profile?.role as string) !== null && roleLower === "staff";
        const onStaffRoute = pathname.startsWith("/staff");

        if (isStaff && !onStaffRoute) {
          router.replace("/staff/manager/terms");
          return;
        }

        if (!isStaff && onStaffRoute) {
          router.replace("/login?error=forbidden");
          return;
        }
      } catch {
        if (!mounted) return;
        setUser(null);
        setLoading(false);

        // Nếu đang ở /staff mà bị 401 → đẩy ra login
        if (pathname.startsWith("/staff")) {
          router.replace("/login");
        }
        // Trang public thì giữ nguyên
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
