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
  isReady: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const authPages = new Set([
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
    ]);

    const accessToken =
      Cookies.get("accessToken") ||
      (typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null);

    // Không có token -> không fetch; đánh dấu ready
    if (!accessToken) {
      setUser(null);
      setIsReady(true);
      return;
    }

    // Ở trang auth -> không fetch, vẫn ready
    if (authPages.has(pathname)) {
      setIsReady(true);
      return;
    }

    // *** QUAN TRỌNG: reset về false trước khi fetch profile ở route mới
    setIsReady(false);

    let mounted = true;
    (async () => {
      try {
        const res = await UserService.getProfile();
        if (mounted) setUser(res);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, setUser, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
