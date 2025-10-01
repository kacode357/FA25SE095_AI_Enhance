import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL_API;

export const defaultAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json; charset=UTF-8" },
});

// === Gắn token từ cookie hoặc sessionStorage vào mỗi request ===
defaultAxiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken") || sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==== Refresh logic ====
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
};

defaultAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const originalRequest = error.config as any;

    // Lỗi khác 401 → xử lý toast bình thường
    if (status !== 401) {
      const data = error.response?.data as { message?: string };
      const message = data?.message || error.message || "Đã có lỗi xảy ra";

      toast.error(message);
      return Promise.reject(error);
    }

    // === Xử lý 401 ===
    if (originalRequest._retry) {
      // Đã thử refresh rồi mà vẫn lỗi → logout
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // Nếu đang refresh thì đẩy request vào hàng chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(defaultAxiosInstance(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;
    const refreshToken = Cookies.get("refreshToken"); // refreshToken chỉ có khi tick Remember me

    // === Nếu không có refreshToken → logout ngay ===
    if (!refreshToken) {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // === Có refreshToken → gọi API refresh ===
    try {
      const res = await axios.post(`${BASE_URL}/Auth/refresh-token`, {
        refreshToken,
        ipAddress: "", // TODO: gắn IP thực nếu cần
        userAgent: "", // TODO: gắn UA thực nếu cần
      });

      const { accessToken, refreshToken: newRefresh } = res.data;

      // Lưu lại token mới vào cookie (remember)
      Cookies.set("accessToken", accessToken, { secure: true, sameSite: "strict" });
      Cookies.set("refreshToken", newRefresh, { expires: 7, secure: true, sameSite: "strict" });

      processQueue(null, accessToken);

      // Retry request gốc
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return defaultAxiosInstance(originalRequest);
    } catch (err) {
      processQueue(err, null);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
