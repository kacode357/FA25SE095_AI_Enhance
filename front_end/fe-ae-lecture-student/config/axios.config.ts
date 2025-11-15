// config/axios.config.ts
import axios, { AxiosError, AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { clearEncodedUser } from "@/utils/secure-user";

/** ===== ENVs ===== */
const USER_BASE_URL = process.env.NEXT_PUBLIC_USER_BASE_URL_API!;
const COURSE_BASE_URL = process.env.NEXT_PUBLIC_COURSE_BASE_URL_API!;
const CRAWL_BASE_URL = process.env.NEXT_PUBLIC_CRAWL_BASE_URL_API!;
const NOTIFICATION_BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_BASE_URL_API!;

/** ===== Token keys ===== */
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/** Access token 1 giờ */
const ACCESS_TOKEN_EXPIRES_DAYS = 1 / 24; // ~1h
/** Refresh token 30 ngày cho remember me */
const REMEMBER_REFRESH_EXPIRES_DAYS = 30;

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

/** Chỉ đọc refreshToken từ cookie
 *  => Nếu có cookie refreshToken tức là login có Remember me
 */
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
    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["role"] ||
      payload["Role"] ||
      undefined
    );
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

  console.warn("[auth] forceLogoutToLogin() called → clear token + user + redirect /login");

  // clear token
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  try {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }

  // clear user cached
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

const createAxiosInstance = (baseURL: string, opts: CreateOpts = {}): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    timeout: opts.timeout ?? 20000,
    // KHÔNG throw cho HTTP 4xx/5xx → mình tự xử lý & toast
    validateStatus: () => true,
  });

  // ----- Request: gắn Bearer + chặn theo role (nếu có role) -----
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const isStudentRoute = path.startsWith("/student");
      const isLecturerRoute = path.startsWith("/lecturer");

      const token = readAccessToken();
      const role = readRoleFromToken(token); // "Student" | "Lecturer" | ...

      // Gắn Authorization nếu có token
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      // 🔥 Chỉ check role khi ĐÃ có role.
      // Nếu token hết hạn / bị xoá → role undefined → KHÔNG cancel,
      // để request đi, BE trả 401 → response interceptor xử lý refresh.
      if (role) {
        if (isStudentRoute && role !== "Student") {
          console.warn("[axios] role mismatch on STUDENT route", { path, role });
          return Promise.reject(new axios.Cancel("role-mismatch: student route"));
        }
        if (isLecturerRoute && role !== "Lecturer") {
          console.warn("[axios] role mismatch on LECTURER route", { path, role });
          return Promise.reject(new axios.Cancel("role-mismatch: lecturer route"));
        }
      }
    }
    return config;
  });

  // ----- Response:
  //  - 401:
  //      + Nếu có refreshToken cookie (remember me) → gọi /Auth/refresh-token, lưu token mới, retry request
  //      + Nếu không có → clear + về /login
  //  - 4xx/5xx khác: toast như cũ
  instance.interceptors.response.use(
    async (response) => {
      const { status, data, config } = response;

      // Chỉ xử lý refresh trên client
      if (status === 401 && typeof window !== "undefined") {
        const originalRequest: any = config || {};

        const url = (originalRequest.url || "").toString().toLowerCase();
        const isAuthLogin = url.includes("/auth/login");
        const isAuthRefresh = url.includes("/auth/refresh-token");

        console.warn("[axios][401] Caught 401 for request", {
          url: originalRequest.url,
          isAuthLogin,
          isAuthRefresh,
          alreadyRetry: originalRequest._retry,
        });

        // Nếu là login / refresh-token thì không auto refresh nữa, để flow cũ xử lý
        if (isAuthLogin || isAuthRefresh) {
          const msg = pickErrorMessage(data, response.statusText || "Unauthorized");
          toast.error(`${msg}`);
          return response;
        }

        // Nếu request này đã retry 1 lần rồi mà vẫn 401 → logout luôn
        if (originalRequest._retry) {
          console.warn("[axios][401] originalRequest._retry = true → force logout");
          forceLogoutToLogin();
          return response;
        }

        // Xem có refreshToken cookie không (=> remember me)
        const refreshToken = readRefreshTokenFromCookie();
        console.log("[axios][401] refreshToken from cookie =", !!refreshToken);

        // Không remember hoặc refreshToken hết hạn → logout luôn
        if (!refreshToken) {
          console.warn("[axios][401] No refreshToken cookie → force logout");
          forceLogoutToLogin();
          return response;
        }

        originalRequest._retry = true;

        try {
          const payload = {
            refreshToken,
            ipAddress: "", // nếu sau này có logic IP thì set sau
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          };

          console.log("[axios][refresh] Call /Auth/refresh-token with payload", payload);

          // Dùng axios gốc, gọi sang USER_BASE_URL
          const refreshResp = await axios.post(
            `${USER_BASE_URL}/Auth/refresh-token`,
            payload,
            {
              headers: { "Content-Type": "application/json; charset=UTF-8" },
              timeout: 15000,
              validateStatus: () => true,
            }
          );

          console.log("[axios][refresh] Response", {
            status: refreshResp.status,
            data: refreshResp.data,
          });

          if (refreshResp.status !== 200) {
            const msg = pickErrorMessage(
              refreshResp.data,
              "Your session has expired. Please sign in again."
            );
            toast.error(msg);
            forceLogoutToLogin();
            return response;
          }

          // Refresh thành công: FE BE đang trả RefreshTokenResponse
          const refreshData: any = refreshResp.data;
          const newAccessToken: string | undefined = refreshData.accessToken;
          const newRefreshToken: string | undefined = refreshData.refreshToken;

          console.log("[axios][refresh] New tokens", {
            hasAccessToken: !!newAccessToken,
            hasRefreshToken: !!newRefreshToken,
          });

          // Cập nhật token mới
          if (newAccessToken) {
            Cookies.set(ACCESS_TOKEN_KEY, newAccessToken, {
              secure: true,
              sameSite: "strict",
              path: "/",
              expires: ACCESS_TOKEN_EXPIRES_DAYS,
            });
          }
          if (newRefreshToken) {
            Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, {
              secure: true,
              sameSite: "strict",
              path: "/",
              expires: REMEMBER_REFRESH_EXPIRES_DAYS, // remember me → 30 ngày
            });
          }

          // gắn header mới và retry request cũ
          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;

          console.log("[axios][refresh] Retry original request", {
            url: originalRequest.url,
          });

          // retry bằng cùng instance để vẫn đi qua interceptors
          return instance(originalRequest);
        } catch (err) {
          console.error("[axios][refresh] Failed to refresh token", err);
          toast.error("Your session has expired. Please sign in again.");
          forceLogoutToLogin();
          return response;
        }
      }

      // Các lỗi 4xx/5xx khác (không phải 401)
      if (status >= 400) {
        const msg = pickErrorMessage(data, response.statusText || `HTTP ${status}`);
        toast.error(`${msg}`);
      }

      return response;
    },
    async (error: AxiosError<any>) => {
      if (axios.isCancel(error)) {
        // role-mismatch / user cancel → không toast
        console.warn("[axios] Request canceled", error.message);
        return Promise.reject(error);
      }
      // network/timeout mới toast
      console.error("[axios] Network/timeout error", error);
      toast.error(error.message || "Không thể kết nối máy chủ");
      return Promise.reject(error);
    }
  );

  return instance;
};

/** ===== Export axios instances ===== */
export const userAxiosInstance = createAxiosInstance(USER_BASE_URL);
export const courseAxiosInstance = createAxiosInstance(COURSE_BASE_URL);
export const notificationAxiosInstance = createAxiosInstance(NOTIFICATION_BASE_URL);
export const crawlAxiosInstance = createAxiosInstance(CRAWL_BASE_URL, { timeout: 600_000 });
