// contexts/AuthContext.tsx
"use client";

import type { UserProfile } from "@/types/user/user.response";
import { clearEncodedUser, loadDecodedUser } from "@/utils/secure-user";
import { clearAuthTokens } from "@/utils/auth/access-token";
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

// helper: home theo role (giờ chỉ còn Staff)
function homeByRole(role?: string) {
  if (role === "Staff") return "/staff/manager/courses";
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

    const isStaffRoute = pathname.startsWith("/staff");

    // route public (login, register, v.v.)
    if (!isStaffRoute) return true;

    if (!user) return false;

    // staff route chỉ cho role = "Staff"
    if (isStaffRoute) return user.role === "Staff";

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
