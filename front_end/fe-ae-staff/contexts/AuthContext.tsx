// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserProfile } from "@/types/user/user.response";
import { UserService } from "@/services/user.services";
import { mapRole } from "@/config/user-role";

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
    const authPages = new Set([
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
    ]);

    // ⚠️ TRANG AUTH → KHÔNG FETCH PROFILE để tránh 401 interceptor gây refresh loop
    if (authPages.has(pathname)) {
      setUser(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const profile = await UserService.getProfile();
        if (!mounted) return;

        setUser(profile);
        setLoading(false);

        const roleLower = (profile.role || "").toLowerCase();
        const isStaff = mapRole(profile.role) !== null && roleLower === "staff";
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
        // Nếu không phải /staff thì cứ để ở nguyên trang public
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
