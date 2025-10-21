// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { UserService } from "@/services/user.services";
import type { UserProfile } from "@/types/user/user.response";

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
      const profile = await UserService.getProfile();
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

  // Theo dõi token đổi: nếu token đổi mà KHÔNG có broadcast mới => coi là sửa tay => logout
  useEffect(() => {
    const checkTokenChanged = () => {
      const current = Cookies.get(ACCESS_TOKEN_KEY);
      const tokenChanged = current !== lastAccessRef.current;
      if (!tokenChanged) return;

      // cập nhật snapshot token
      lastAccessRef.current = current;

      // Nếu không còn token → về login
      if (!current) {
        _setUser(null);
        if (!AUTH_PAGES.has(pathname)) goLogin();
        return;
      }

      // Có token mới: kiểm tra broadcast
      const now = Date.now();
      const ts = readBroadcastTS();
      const hasRecentBroadcast = ts > lastBroadcastRef.current && now - ts <= 3000; // cho phép lệch 3s
      // lưu lại ts mới nhất để lần sau so sánh
      lastBroadcastRef.current = Math.max(lastBroadcastRef.current, ts);

      if (!hasRecentBroadcast) {
        // => token bị đổi tay (không do login/refresh chính thống) => coi là gian lận
        clearTokens();
        _setUser(null);
        goLogin();
        return;
      }

      // Có broadcast hợp lệ → fetch lại profile (đổi account/refresh hợp lệ)
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

    // init lần đầu
    // đồng bộ các mốc ban đầu
    lastAccessRef.current = Cookies.get(ACCESS_TOKEN_KEY);
    lastBroadcastRef.current = readBroadcastTS();

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, [pathname, refreshProfile]);

  // Lắng nghe broadcast đa tab (đổi hợp lệ)
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
