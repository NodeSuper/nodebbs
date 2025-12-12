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
};

export default nextConfig;
