/** @type {import('next').NextConfig} */

// ============================================================
// Bảo vệ production: KHÔNG cho phép chạy với mock data bật
// ============================================================
if (
  process.env.NODE_ENV === "production" &&
  (process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_MOCK_LOGIN === "true")
) {
  throw new Error(
    "[Production Guard] NEXT_PUBLIC_ENABLE_MOCK và NEXT_PUBLIC_ENABLE_MOCK_LOGIN phải là 'false' trong production.\n" +
    "Đặt cả hai biến này trong file .env.production hoặc biến môi trường của server."
  );
}

const nextConfig = {
  reactStrictMode: true,

  // Chặn expose source maps ở production
  productionBrowserSourceMaps: false,

  // Custom headers bảo mật
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Proxy /api requests to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
