module.exports = {
  apps: [
    {
      // name: "next-dash",
      name: `${process.env.APP_NAME}-dash`,
      script: 'node_modules/next/dist/bin/next',
      // script: '.next/standalone/server.js', // 为后续docker部署准备, 需要同步静态文件 cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
      args: `start -p ${process.env.PORT}`, // 指定端口
      exec_mode: 'cluster', // 启用集群模式
      // instances: "max",      // 使用所有 CPU 核心
      instances: 1, // 使用所有 CPU 核心
      autorestart: true, // 崩溃自动重启
      watch: false, // 禁用文件监听（生产环境建议关闭）
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
