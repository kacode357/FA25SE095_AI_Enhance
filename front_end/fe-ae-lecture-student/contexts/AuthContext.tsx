// contexts/AuthContext.tsx
"use client";

import { ROLE_LECTURER, ROLE_STUDENT, UserServiceRole } from "@/config/user-service/user-role";
import { UserService } from "@/services/user.services";
import type { UserProfile } from "@/types/user/user.response";
import { clearAuthTokens, getRememberMeFlag } from "@/utils/auth/access-token";
import { clearEncodedUser, loadDecodedUser, saveEncodedUser } from "@/utils/secure-user";
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

// helper
function homeByRole(role?: string) {
  const STUDENT = UserServiceRole[ROLE_STUDENT];
  const LECTURER = UserServiceRole[ROLE_LECTURER];
  if (role === STUDENT) return "/student/home";
  if (role === LECTURER) return "/lecturer/course";
  return "/";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  // load user từ cache cookie lúc mount
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

    // route public (login, register, v.v.)
    if (!isStudentRoute && !isLecturerRoute) return true;

    if (!user) return false;

    const STUDENT = UserServiceRole[ROLE_STUDENT];
    const LECTURER = UserServiceRole[ROLE_LECTURER];

    if (isStudentRoute) return user.role === STUDENT;
    if (isLecturerRoute) return user.role === LECTURER;

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
    try {
      // Try to fetch latest profile from server
      const res = await UserService.getProfile();
      if (res && (res.status === 200 || res.status === 100) && res.data) {
        // persist updated profile using current remember flag
        const remember = getRememberMeFlag();
        await saveEncodedUser(res.data, remember);
        setUser(res.data);
        
        // Dispatch event để các component khác (như UserMenu) cũng cập nhật
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("app:user-updated"));
        }
        return;
      }
    } catch (err) {
      // fallback to cached value if network fails
    }

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
