// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { UserService } from "@/services/user.services";
import type { UserProfile } from "@/types/user/user.response";
import type { ApiResponse } from "@/types/auth/auth.response";

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

const AUTH_PAGES = new Set(["/login","/register","/verify-email","/forgot-password","/reset-password"]);
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
}

const goLogin = () => {
  if (typeof window !== "undefined") window.location.replace("/login");
};

/** Đọc dấu vết broadcast gần nhất */
function readBroadcastTS(): number {
  try {
    const raw = localStorage.getItem("auth:broadcast");
    if (!raw) return 0;
    const obj = JSON.parse(raw);
    return typeof obj?.at === "number" ? obj.at : 0;
  } catch {
    return 0;
  }
}

/** Type guard cho ApiResponse */
function isApiResponse<T>(v: any): v is ApiResponse<T> {
  return v && typeof v === "object" && "status" in v && "data" in v;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, _setUser] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  const lastAccessRef = useRef<string | undefined>(undefined);
  const lastBroadcastRef = useRef<number>(0);

  const hasToken = () => !!Cookies.get(ACCESS_TOKEN_KEY);
  const hardResetUser = () => _setUser(null);

  const refreshProfile = useCallback(async () => {
    if (!hasToken()) {
      _setUser(null);
      if (!AUTH_PAGES.has(pathname)) goLogin();
      return;
    }
    try {
      // Có thể là ApiResponse<UserProfile> HOẶC UserProfile, tùy backend
      const res = await UserService.getProfile();
      const profile: UserProfile = isApiResponse<UserProfile>(res) ? res.data : (res as UserProfile);

      _setUser(profile);
    } catch {
      clearTokens();
      _setUser(null);
      if (!AUTH_PAGES.has(pathname)) goLogin();
    }
  }, [pathname]);

  const logout = useCallback(() => {
    clearTokens();
    _setUser(null);
    // phát broadcast cho đa tab
    try { localStorage.setItem("auth:broadcast", JSON.stringify({ at: Date.now(), reason: "logout" })); } catch {}
    goLogin();
  }, []);

  // F5/đổi route: reset + fetch profile
  useEffect(() => {
    if (AUTH_PAGES.has(pathname)) {
      _setUser(null);
      return;
    }
    hardResetUser();
    refreshProfile();
  }, [pathname, refreshProfile]);

  // Theo dõi token đổi
  useEffect(() => {
    const checkTokenChanged = () => {
      const current = Cookies.get(ACCESS_TOKEN_KEY);
      const tokenChanged = current !== lastAccessRef.current;
      if (!tokenChanged) return;

      lastAccessRef.current = current;

      if (!current) {
        _setUser(null);
        if (!AUTH_PAGES.has(pathname)) goLogin();
        return;
      }

      const now = Date.now();
      const ts = readBroadcastTS();
      const hasRecentBroadcast = ts > lastBroadcastRef.current && now - ts <= 3000;
      lastBroadcastRef.current = Math.max(lastBroadcastRef.current, ts);

      if (!hasRecentBroadcast) {
        clearTokens();
        _setUser(null);
        goLogin();
        return;
      }

      if (!AUTH_PAGES.has(pathname)) {
        hardResetUser();
        refreshProfile();
      }
    };

    const onFocus = () => checkTokenChanged();
    const onVisibility = () => checkTokenChanged();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(checkTokenChanged, 2000);

    lastAccessRef.current = Cookies.get(ACCESS_TOKEN_KEY);
    lastBroadcastRef.current = readBroadcastTS();

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, [pathname, refreshProfile]);

  // Lắng nghe broadcast đa tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth:broadcast") {
        const ts = readBroadcastTS();
        lastBroadcastRef.current = Math.max(lastBroadcastRef.current, ts);
        hardResetUser();
        refreshProfile();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{ user, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
