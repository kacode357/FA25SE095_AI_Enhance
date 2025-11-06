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

// ⬇️ helper: xác định trang home theo role
function homeByRole(role?: string) {
  const STUDENT = UserServiceRole[ROLE_STUDENT];   // "Student"
  const LECTURER = UserServiceRole[ROLE_LECTURER]; // "Lecturer"
  if (role === STUDENT) return "/student/all-courses";
  if (role === LECTURER) return "/lecturer/manager/course";
  return "/";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const cached = await loadDecodedUser();
      setUser(cached);
      setLoaded(true);
    })();
  }, []);

  const allow = useMemo(() => {
    if (!loaded) return false;
    const isStudentRoute = pathname.startsWith("/student");
    const isLecturerRoute = pathname.startsWith("/lecturer");
    if (!isStudentRoute && !isLecturerRoute) return true; // /login không bảo vệ
    if (!user) return false;
    const STUDENT = UserServiceRole[ROLE_STUDENT];
    const LECTURER = UserServiceRole[ROLE_LECTURER];
    if (isStudentRoute)  return user.role === STUDENT;
    if (isLecturerRoute) return user.role === LECTURER;
    return true;
  }, [loaded, user, pathname]);

  useLayoutEffect(() => {
    if (!loaded) return;

    // ✅ MỚI: đang ở /login mà đã có user -> redirect theo role
    if (user && pathname === "/login") {
      if (typeof window !== "undefined") window.location.replace(homeByRole(user.role));
      return; // chặn các xử lý bên dưới
    }

    // Không được phép vào route bảo vệ -> clear + về /login
    if (!allow) {
      clearTokens();
      clearEncodedUser();
      setUser(null);
      if (typeof window !== "undefined") window.location.replace("/login");
    }
  }, [allow, loaded, user, pathname]);

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

  if (!loaded || !allow) return null;

  return (
    <AuthContext.Provider value={{ user, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
