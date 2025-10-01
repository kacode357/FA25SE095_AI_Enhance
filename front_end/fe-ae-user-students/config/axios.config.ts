// config/axios.config.ts
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

// BASE_URL cho User/Auth Service
const USER_BASE_URL = process.env.NEXT_PUBLIC_USER_BASE_URL_API; 
// BASE_URL cho Course Service
const COURSE_BASE_URL = process.env.NEXT_PUBLIC_COURSE_BASE_URL_API; 

// Hàm tạo Axios Instance với logic refresh token chung
const createAxiosInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });

  // === Gắn token từ cookie hoặc sessionStorage vào mỗi request ===
  instance.interceptors.request.use((config) => {
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

  instance.interceptors.response.use(
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
              resolve(instance(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;
      const refreshToken = Cookies.get("refreshToken"); 

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
        // QUAN TRỌNG: API refresh-token vẫn gọi về USER_BASE_URL (Auth service)
        const res = await axios.post(`${USER_BASE_URL}/Auth/refresh-token`, { 
          refreshToken,
          ipAddress: "", 
          userAgent: "",
        });

        const { accessToken, refreshToken: newRefresh } = res.data;

        // Lưu lại token mới
        Cookies.set("accessToken", accessToken, { secure: true, sameSite: "strict" });
        Cookies.set("refreshToken", newRefresh, { expires: 7, secure: true, sameSite: "strict" });

        processQueue(null, accessToken);

        // Retry request gốc
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest); 
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
  return instance;
};

// Instance cho User/Auth Service (http://localhost:5001/api)
export const userAxiosInstance = createAxiosInstance(USER_BASE_URL!); 

// Instance cho Course Service (http://localhost:5006/api)
export const courseAxiosInstance = createAxiosInstance(COURSE_BASE_URL!);