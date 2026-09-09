import axios from 'axios';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor: đính kèm JWT token vào mỗi request ──
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: xử lý lỗi 401 ──
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Nếu 401 và không phải đang call login → xóa token + redirect về login
      if (
        error.response?.status === 401 &&
        typeof window !== 'undefined' &&
        !error.config?.url?.includes('/api/auth/login')
      ) {
        clearAccessToken();
        // Chỉ redirect nếu chưa ở trang login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Không có response = không kết nối được server
      if (!error.response) {
        return Promise.reject(
          new Error(
            `Không thể kết nối máy chủ (${BASE_URL}). ` +
            `Vui lòng kiểm tra Backend đã khởi động chưa.`
          )
        );
      }
    }
    return Promise.reject(error);
  }
);

export const api = axiosInstance;
export default axiosInstance;
