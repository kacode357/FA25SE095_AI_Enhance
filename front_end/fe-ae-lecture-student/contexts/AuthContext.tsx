// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import type { UserProfile } from "@/types/user/user.response";
import { loadDecodedUser, clearEncodedUser } from "@/utils/secure-user";
import { UserServiceRole, ROLE_STUDENT, ROLE_LECTURER } from "@/config/user-service/user-role";

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

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  // Load user (a:u) trước khi render app
  useEffect(() => {
    (async () => {
      const cached = await loadDecodedUser();
      setUser(cached);
      setLoaded(true);
    })();
  }, []);

  // Tính quyền truy cập: route bảo vệ yêu cầu có user + đúng role
  const allow = useMemo(() => {
    if (!loaded) return false; // chờ xong mới quyết
    const isStudentRoute = pathname.startsWith("/student");
    const isLecturerRoute = pathname.startsWith("/lecturer");

    // các route không bảo vệ -> cho qua
    if (!isStudentRoute && !isLecturerRoute) return true;

    // route bảo vệ: phải có user
    if (!user) return false;

    const STUDENT = UserServiceRole[ROLE_STUDENT];   // "Student"
    const LECTURER = UserServiceRole[ROLE_LECTURER]; // "Lecturer"
    if (isStudentRoute)  return user.role === STUDENT;
    if (isLecturerRoute) return user.role === LECTURER;
    return true;
  }, [loaded, user, pathname]);

  // Nếu không được phép: clear + redirect ngay (trước khi paint)
  useLayoutEffect(() => {
    if (!loaded) return;
    if (allow) return;
    clearTokens();
    clearEncodedUser();
    setUser(null);
    if (typeof window !== "undefined") window.location.replace("/login");
  }, [allow, loaded]);

  const refreshProfile = useCallback(async () => {
    const cached = await loadDecodedUser();
    setUser(cached);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    clearEncodedUser();
    setUser(null);
    if (typeof window !== "undefined") window.location.replace("/login");
  }, []);

  // Không render cho tới khi check xong và hợp lệ
  if (!loaded || !allow) return null;

  return (
    <AuthContext.Provider value={{ user, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
