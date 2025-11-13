// config/axios.config.ts
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

  // ----- Request: chặn theo role (tuỳ chọn) + gắn Bearer -----
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const isStudentRoute = path.startsWith("/student");
      const isLecturerRoute = path.startsWith("/lecturer");

      const token = readAccessToken();
      const role = readRoleFromToken(token); // "Student" | "Lecturer" | ...

      // Nếu route bảo vệ mà role không khớp → huỷ request, không gọi API
      if (isStudentRoute && role !== "Student") {
        return Promise.reject(new axios.Cancel("role-mismatch: student route"));
      }
      if (isLecturerRoute && role !== "Lecturer") {
        return Promise.reject(new axios.Cancel("role-mismatch: lecturer route"));
      }

      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // ----- Response:
  //  - 4xx/5xx: vẫn đi vào "success" do validateStatus=true → tự toast BE message
  //  - Network/timeout/cancel: vào "error" → im lặng cho cancel, toast cho network
  instance.interceptors.response.use(
    (response) => {
      const { status, data } = response;
      if (status >= 400) {
        const msg = pickErrorMessage(data, response.statusText || `HTTP ${status}`);
        toast.error(`${msg}`);
      }
      return response;
    },
    async (error: AxiosError<any>) => {
      if (axios.isCancel(error)) {
        // role-mismatch / user cancel → không toast
        return Promise.reject(error);
      }
      // network/timeout mới toast
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
