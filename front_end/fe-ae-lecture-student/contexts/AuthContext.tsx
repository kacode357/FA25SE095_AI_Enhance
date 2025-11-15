// contexts/AuthContext.tsx
"use client";

import { ROLE_LECTURER, ROLE_STUDENT, UserServiceRole } from "@/config/user-service/user-role";
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

// ⬇️ helper: xác định trang home theo role
function homeByRole(role?: string) {
  const STUDENT = UserServiceRole[ROLE_STUDENT];   // "Student"
  const LECTURER = UserServiceRole[ROLE_LECTURER]; // "Lecturer"
  if (role === STUDENT) return "/student/all-courses";
  if (role === LECTURER) return "/lecturer/course";
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

    // ✅ đang ở /login mà đã có user -> redirect theo role
    if (user && pathname === "/login") {
      if (typeof window !== "undefined") window.location.replace(homeByRole(user.role));
      return;
    }

    // Không được phép vào route bảo vệ -> clear + về /login
    if (!allow) {
      clearAuthTokens();
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
    clearAuthTokens();
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
