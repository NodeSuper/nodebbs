/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 匹配所有域名
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // 启用 standalone 输出模式，用于 Docker 部署
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.SERVER_API_URL || "http://localhost:7100"}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${process.env.SERVER_API_URL || "http://localhost:7100"}/uploads/:path*`,
      },
      {
        source: "/docs/:path*",
        destination: `${process.env.SERVER_API_URL || "http://localhost:7100"}/docs/:path*`,
      },
    ];
  },
};

export default nextConfig;
