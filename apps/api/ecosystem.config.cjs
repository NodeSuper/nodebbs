module.exports = {
  apps: [
    {
      name: `${process.env.APP_NAME}-api`,
      script: './src/app.js',
      // instances: 'max', // 使用最大可用CPU核心数
      instances: 1, // 使用最大可用CPU核心数
      // exec_mode: 'cluster', // 使用集群模式 可以是 “cluster” 或 “fork”，默认 fork
      env: {
        // NODE_ENV: 'production', // pm2 启动优先使用这个值
        LOG_LEVEL: 'info',
        // PORT: 7100,
      },
    },
  ],
};
