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
  const token = Cookies.get(REFRESH_TOKEN_KEY);
  return token || undefined;
}

/** Decode role từ JWT payload (để chặn API theo route/role nếu cần) */
function readRoleFromToken(token?: string): string | undefined {
  if (!token) return undefined;
  const parts = token.split(".");
  if (parts.length < 2) return undefined;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.role;
  } catch {
    return undefined;
  }
}

/** Rút thông điệp lỗi từ payload đa dạng của BE */
function pickErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return (
    data.message ||
    data.error ||
    data.title ||
    (Array.isArray(data.details) && data.details[0]) ||
    fallback
  );
}

/** Clear token + user + redirect về /login */
function forceLogoutToLogin() {
  if (typeof window === "undefined") return;

  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  try {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }

  try {
    clearEncodedUser();
  } catch {
    // ignore
  }

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

/** ===== Factory: axios instance với interceptors ===== */
type CreateOpts = { timeout?: number };

const createAxiosInstance = (
  baseURL: string,
  opts: CreateOpts = {}
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    timeout: opts.timeout ?? 30000,
    validateStatus: () => true,
  });

  // ----- Request: gắn Bearer + chặn theo role (nếu có role) -----
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const isStudentRoute = path.startsWith("/student");
      const isLecturerRoute = path.startsWith("/lecturer");

      const token = readAccessToken();
      const role = readRoleFromToken(token);

      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      if (role) {
        if (isStudentRoute && role !== "Student") {
          return Promise.reject(new axios.Cancel("role-mismatch: student route"));
        }
        if (isLecturerRoute && role !== "Lecturer") {
          return Promise.reject(
            new axios.Cancel("role-mismatch: lecturer route")
          );
        }
      }
    }
    return config;
  });

  // ----- Response + refresh token -----
  instance.interceptors.response.use(
    async (response) => {
      const { status, data, config } = response;

      if (status === 401 && typeof window !== "undefined") {
        const originalRequest: any = config || {};

        const url = (originalRequest.url || "").toString().toLowerCase();
        const isAuthLogin = url.includes("/auth/login");
        const isAuthRefresh = url.includes("/auth/refresh-token");

        // Login / refresh-token bị 401 -> báo lỗi, không auto refresh
        if (isAuthLogin || isAuthRefresh) {
          const msg = pickErrorMessage(data, response.statusText || "Unauthorized");
          toast.error(`${msg}`);
          return response;
        }

        // Đã retry rồi mà vẫn 401 → logout
        if (originalRequest._retry) {
          forceLogoutToLogin();
          return response;
        }

        const refreshToken = readRefreshTokenFromCookie();

        // Không có refreshToken (không remember / hết hạn) → logout
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

          // BE trả { status, message, data: { accessToken, refreshToken, ... } }
          const raw = refreshResp.data as any;
          const refreshData = raw?.data ?? raw;

          const newAccessToken: string | undefined = refreshData?.accessToken;
          const newRefreshToken: string | undefined = refreshData?.refreshToken;

          if (!newAccessToken) {
            forceLogoutToLogin();
            return response;
          }

          // giao cho utils/auth-access-token lo chuyện lưu + TTL
          updateAccessToken(newAccessToken);
          if (newRefreshToken) {
            updateRefreshToken(newRefreshToken);
          }

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

      // If the request set suppressToast, skip global toasts for this response
      const reqConfig: any = config || {};
      if (reqConfig.suppressToast) {
        return response;
      }

      // Các lỗi 4xx/5xx khác (không phải 401)
      if (status >= 400) {
        const msg = pickErrorMessage(
          data,
          response.statusText || `HTTP ${status}`
        );
        toast.error(`${msg}`);
      }

      return response;
    },
    async (error: AxiosError<any>) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }
      toast.error(error.message || "Unable to connect to server");
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
