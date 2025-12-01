// contexts/AuthContext.tsx
"use client";

import { ROLE_ADMIN, UserServiceRole } from "@/config/user-service/user-role";
import type { UserProfile } from "@/types/user/user.response";
import { clearAuthTokens } from "@/utils/auth/access-token";
import { clearEncodedUser, loadDecodedUser } from "@/utils/secure-user";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

type AuthContextType = {
  user: UserProfile | null;
  refreshProfile: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  refreshProfile: async () => {},
  logout: () => {},
});

// helper: home theo role (giờ là Admin)
function homeByRole(role?: string) {
  const ADMIN = UserServiceRole[ROLE_ADMIN];
  if (role === ADMIN) return "/admin";
  return "/";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  // load user từ cache (cookie/session) lúc mount
  useEffect(() => {
    (async () => {
      const cached = await loadDecodedUser();
      setUser(cached);
      setLoaded(true);
    })();
  }, []);

  const allow = useMemo(() => {
    if (!loaded) return false;

    const isAdminRoute = pathname.startsWith("/admin");

    // route public (login, register, v.v.)
    if (!isAdminRoute) return true;

    if (!user) return false;

    const ADMIN = UserServiceRole[ROLE_ADMIN];

    // admin route chỉ cho Admin
    if (isAdminRoute) return user.role === ADMIN;

    return true;
  }, [loaded, user, pathname]);

  useLayoutEffect(() => {
    if (!loaded) return;

    // đang ở /login mà đã có user -> redirect theo role
    if (user && pathname === "/login") {
      const target = homeByRole(user.role);
      if (typeof window !== "undefined") {
        window.location.replace(target);
      }
      return;
    }

    // route bảo vệ mà không được phép -> clear + về /login
    if (!allow) {
      clearAuthTokens();
      clearEncodedUser();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  }, [allow, loaded, user, pathname]);

  const refreshProfile = useCallback(async () => {
    const cached = await loadDecodedUser();
    setUser(cached);
  }, []);

  const logout = useCallback(() => {
    clearAuthTokens();
    clearEncodedUser();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, []);

  if (!loaded || !allow) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
