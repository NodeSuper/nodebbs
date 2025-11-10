/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3300'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 匹配所有域名
      },
    ],
  },
  // 启用 standalone 输出模式，用于 Docker 部署
  output: 'standalone',
};

export default nextConfig;
