// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { UserProfile } from "@/types/user/user.response";
import { UserService } from "@/services/user.services";

type AuthContextType = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const authPages = new Set([
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
    ]);

    // 1) Không có token -> không fetch profile
    const accessToken =
      Cookies.get("accessToken") ||
      (typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null);

    if (!accessToken) {
      setUser(null);
      return;
    }

    // 2) Đang ở trang auth -> tránh fetch để ngăn vòng lặp reset
    if (authPages.has(pathname)) {
      // vẫn giữ user như hiện tại; không gọi API ở /login
      return;
    }

    // 3) Fetch profile ở các trang “app” khác khi có token
    let mounted = true;
    (async () => {
      try {
        const res = await UserService.getProfile();
        if (mounted) setUser(res);
      } catch {
        if (mounted) setUser(null);
        // interceptor sẽ clear token; đừng redirect ở đây
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
