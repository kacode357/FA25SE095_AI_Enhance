// config/axios.config.ts
import {
  updateAccessToken,
  updateRefreshToken,
} from "@/utils/auth/access-token";
import { clearEncodedUser } from "@/utils/secure-user";
import axios, { AxiosError, AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

/** ===== ENVs ===== */
const USER_BASE_URL = process.env.NEXT_PUBLIC_USER_BASE_URL_API!;
const COURSE_BASE_URL = process.env.NEXT_PUBLIC_COURSE_BASE_URL_API!;
const CRAWL_BASE_URL = process.env.NEXT_PUBLIC_CRAWL_BASE_URL_API!;
const NOTIFICATION_BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_BASE_URL_API!;

/** ===== Token keys ===== */
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/** Đọc accessToken: ưu tiên cookie, fallback sessionStorage */
function readAccessToken(): string | undefined {
  const fromCookie = Cookies.get(ACCESS_TOKEN_KEY);
  if (fromCookie) return fromCookie;
  if (typeof window !== "undefined") {
    const fromSession = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    return fromSession || undefined;
  }
  return undefined;
}

/** Chỉ đọc refreshToken từ cookie */
function readRefreshTokenFromCookie(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY) || undefined;
}

/** Decode role từ JWT payload */
function readRoleFromToken(token?: string): string | undefined {
  if (!token) return undefined;
  const parts = token.split(".");
  if (parts.length < 2) return undefined;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.role; // VD: "Staff"
  } catch {
    return undefined;
  }
}

/** Extract lỗi */
function pickErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === "string") return data;

  // Prefer explicit message/title fields
  const title = data.message || data.error || data.title;

  // If backend provided a structured `errors` object (validation errors),
  // flatten and join them so the toast shows detailed messages.
  if (data.errors && typeof data.errors === "object") {
    const parts: string[] = [];
    for (const key of Object.keys(data.errors)) {
      const val = data.errors[key];
      if (Array.isArray(val)) {
        parts.push(...val.filter(Boolean).map((v: any) => String(v)));
      } else if (val) {
        parts.push(String(val));
      }
    }
    if (parts.length) {
      return title ? `${title}: ${parts.join(" ")}` : parts.join(" ");
    }
  }

  if (Array.isArray(data.details) && data.details.length) return data.details[0];

  return title || fallback;
}

/** Clear token + user + redirect login */
function forceLogoutToLogin() {
  if (typeof window === "undefined") return;

  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });

  try {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}

  try {
    clearEncodedUser();
  } catch {}

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

/** ===== Factory: axios instance với interceptors ==== */
type CreateOpts = { timeout?: number };

const createAxiosInstance = (
  baseURL: string,
  opts: CreateOpts = {}
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    timeout: opts.timeout ?? 60000,
    validateStatus: () => true,
  });

  /** ============================
   *  REQUEST INTERCEPTOR
   *  ============================ */
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;

      // chỉ còn staff route
      const isStaffRoute = path.startsWith("/staff");

      const token = readAccessToken();
      const role = readRoleFromToken(token); // "Staff" | undefined

      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      // staff route mà role không phải Staff
      if (isStaffRoute && role && role !== "Staff") {
        return Promise.reject(new axios.Cancel("role-mismatch: staff route"));
      }
    }
    return config;
  });

  /** ============================
   *  RESPONSE + REFRESH LOGIC
   *  ============================ */
  instance.interceptors.response.use(
    async (response) => {
      const { status, data, config } = response;

      if (status === 401 && typeof window !== "undefined") {
        const originalRequest: any = config || {};

        const url = (originalRequest.url || "").toString().toLowerCase();
        const isAuthLogin = url.includes("/auth/login");
        const isAuthRefresh = url.includes("/auth/refresh-token");

        if (isAuthLogin || isAuthRefresh) {
          const msg = pickErrorMessage(data, "Unauthorized");
          toast.error(msg);
          return response;
        }

        if (originalRequest._retry) {
          forceLogoutToLogin();
          return response;
        }

        const refreshToken = readRefreshTokenFromCookie();
        if (!refreshToken) {
          forceLogoutToLogin();
          return response;
        }

        originalRequest._retry = true;

        try {
          const payload = {
            refreshToken,
            ipAddress: "",
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : "",
          };

          const refreshResp = await axios.post(
            `${USER_BASE_URL}/Auth/refresh-token`,
            payload,
            {
              headers: { "Content-Type": "application/json; charset=UTF-8" },
              timeout: 15000,
              validateStatus: () => true,
            }
          );

          if (refreshResp.status !== 200) {
            const msg = pickErrorMessage(
              refreshResp.data,
              "Your session has expired. Please sign in again."
            );
            toast.error(msg);
            forceLogoutToLogin();
            return response;
          }

          const raw = refreshResp.data as any;
          const refreshData = raw?.data ?? raw;

          const newAccessToken: string | undefined = refreshData?.accessToken;
          const newRefreshToken: string | undefined = refreshData?.refreshToken;

          if (!newAccessToken) {
            forceLogoutToLogin();
            return response;
          }

          updateAccessToken(newAccessToken);
          if (newRefreshToken) updateRefreshToken(newRefreshToken);

          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as any).Authorization =
            `Bearer ${newAccessToken}`;

          return instance(originalRequest);
        } catch {
          toast.error("Your session has expired. Please sign in again.");
          forceLogoutToLogin();
          return response;
        }
      }

      if (status >= 400) {
        const msg = pickErrorMessage(
          data,
          response.statusText || `HTTP ${status}`
        );
        toast.error(msg);
      }

      return response;
    },
    async (error: AxiosError<any>) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }
      toast.error(error.message || "Không thể kết nối máy chủ");
      return Promise.reject(error);
    }
  );

  return instance;
};

/** ===== Export axios instances ===== */
export const userAxiosInstance = createAxiosInstance(USER_BASE_URL);
export const courseAxiosInstance = createAxiosInstance(COURSE_BASE_URL);
export const notificationAxiosInstance =
  createAxiosInstance(NOTIFICATION_BASE_URL);
export const crawlAxiosInstance = createAxiosInstance(CRAWL_BASE_URL, {
  timeout: 600_000,
});
