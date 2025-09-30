import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { logout, setAccessToken } from "../store/slices/authSlice"; // ✅ เพิ่ม import

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ต้องใช้ cookie refresh token
});

// ===== Request Interceptor =====
http.interceptors.request.use(async (config) => {
  const { store } = await import("../store");
  const token = store.getState().auth.accessToken;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log("👉 Sending request with token:", token.slice(0, 20) + "..."); // debug
  }
  return config;
});

// ===== Refresh Logic =====
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ===== Response Interceptor =====
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 👉 401 = token หมดอายุ หรือไม่ถูกต้อง → logout
    if (error.response?.status === 401) {
      const { store } = await import("../store");
      store.dispatch(logout());
      return Promise.reject(error);
    }

    // 👉 403 = ต้อง refresh token
    if (error.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        // ถ้ามีการ refresh อยู่แล้ว → รอ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          "/smartgate-api/v0/users/refresh",
          {},
          { baseURL: import.meta.env.VITE_API_URL, withCredentials: true }
        );

        const newToken: string = refreshResponse.data?.accessToken;

        if (newToken) {
          http.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          console.log("🔄 Retrying with new token:", newToken.slice(0, 20) + "...");
        }
        return http(originalRequest);

        processQueue(null, newToken);
        return http(originalRequest);
      } catch (err) {
        processQueue(err, null);
        const { store } = await import("../store");
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }

    }

    return Promise.reject(error);
  }
);

export default http;
