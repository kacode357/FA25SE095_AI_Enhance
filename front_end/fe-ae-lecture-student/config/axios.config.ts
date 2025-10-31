// config/axios.config.ts
import axios, { AxiosError, AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

/** ===== ENVs ===== */
const USER_BASE_URL = process.env.NEXT_PUBLIC_USER_BASE_URL_API!;
const COURSE_BASE_URL = process.env.NEXT_PUBLIC_COURSE_BASE_URL_API!;
const CRAWL_BASE_URL = process.env.NEXT_PUBLIC_CRAWL_BASE_URL_API!;

/** ===== Cookie keys ===== */
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/** ===== Helpers ===== */
const broadcast = (reason: "login" | "refresh" | "logout") => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("auth:broadcast", JSON.stringify({ at: Date.now(), reason }));
    } catch {}
  }
};

const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};

const goLogin = () => {
  if (typeof window !== "undefined") window.location.replace("/login");
};

const goHome = () => {
  if (typeof window !== "undefined") window.location.replace("/");
};

/** ===== Factory: create axios instance với refresh queue ===== */
type CreateOpts = { timeout?: number };

const createAxiosInstance = (baseURL: string, opts: CreateOpts = {}): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    // Timeout mặc định (nếu không truyền) để tương thích các service khác
    timeout: opts.timeout ?? 20000, // 20s default
  });

  /** ----- Request: gắn Bearer từ cookie ----- */
  instance.interceptors.request.use((config) => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  });

  /** ----- Refresh queue state ----- */
  let isRefreshing = false;
  let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
  };

  /** ----- Response: handle errors ----- */
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
      const status = error.response?.status;
      const originalRequest: any = error.config;

      // Network/timeout -> báo lỗi chung
      if (status == null) {
        toast.error(error.message || "Không thể kết nối máy chủ");
        return Promise.reject(error);
      }

      /** 403: Sai quyền -> về "/" cho guard xử lý */
      if (status === 403) {
        goHome();
        return Promise.reject(error);
      }

      /** Khác 401/403 -> show toast */
      if (status !== 401) {
        const data = error.response?.data as { message?: string };
        const message = data?.message || error.message || "Đã có lỗi xảy ra";
        toast.error(message);
        return Promise.reject(error);
      }

      /** 401: Unauthorized -> thử refresh 1 lần */
      if (originalRequest?._retry) {
        clearTokens();
        broadcast("logout");
        goLogin();
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        broadcast("logout");
        goLogin();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${USER_BASE_URL}/Auth/refresh-token`, {
          refreshToken,
          ipAddress: "",
          userAgent: "",
        });

        const { accessToken, refreshToken: newRefresh } = res.data || {};
        if (!accessToken) throw new Error("No accessToken from refresh");

        Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
          secure: true,
          sameSite: "strict",
          path: "/",
        });
        if (newRefresh) {
          Cookies.set(REFRESH_TOKEN_KEY, newRefresh, {
            secure: true,
            sameSite: "strict",
            path: "/",
            expires: 7,
          });
        }

        broadcast("refresh");

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        broadcast("logout");
        goLogin();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return instance;
};

/** ===== Export axios instances ===== */
// giữ mặc định 20s cho user/course
export const userAxiosInstance = createAxiosInstance(USER_BASE_URL);
export const courseAxiosInstance = createAxiosInstance(COURSE_BASE_URL);

// tăng timeout cho crawl (ví dụ 180s)
export const crawlAxiosInstance = createAxiosInstance(CRAWL_BASE_URL, {
  timeout: 600_000, // 10 phút cho các request khởi tạo/điều phối crawl
});
