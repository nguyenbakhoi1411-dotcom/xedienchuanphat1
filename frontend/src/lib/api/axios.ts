import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  getRefreshToken,
  isRememberedSession,
  saveAccessToken
} from "@/lib/auth/token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  timeout: 20_000
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAccessToken();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await axios.post<{ accessToken: string }>(
        `${api.defaults.baseURL}/api/auth/refresh`,
        { refreshToken },
        { timeout: 20_000 }
      );
      saveAccessToken(response.data.accessToken, isRememberedSession());
      originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      return Promise.reject(refreshError);
    }
  }
);
