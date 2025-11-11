import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { logout, setAccessToken } from "../store/slices/authSlice";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ===== Request Interceptor =====
http.interceptors.request.use(async (config) => {
  const { store } = await import("../store");
  const token = store.getState().auth.accessToken;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    //console.log("👉 Sending request with token:", token.slice(0, 20) + "...");
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

    // --- Case 401: Access Token หมดอายุหรือไม่ถูกต้อง ---
    if (error.response?.status === 401) {
      const { store } = await import("../store");
      store.dispatch(logout());
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // --- Case 403: ต้องลอง refresh ---
    if (error.response?.status === 403) {
      if (originalRequest._retry) {
        const { store } = await import("../store");
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
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
        if (!newToken) throw new Error("No accessToken in refresh response");

        const { store } = await import("../store");
        store.dispatch(setAccessToken(newToken));

        http.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return http(originalRequest);

      } catch (err: any) {
        // ✅ refresh fail → อาจจะเพราะ 401 หรือ cookie หมดอายุ → logout + redirect
        processQueue(err, null);
        const { store } = await import("../store");
        store.dispatch(logout());
        console.warn("❌ Refresh failed (likely 401), logging out...");
        window.location.href = "/login"; // ✅ force redirect
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
