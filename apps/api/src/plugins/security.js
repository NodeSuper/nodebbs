import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import env from '../config/env.js';
import { isOriginAllowed, parseAllowedOrigins } from '../utils/http-helpers.js';

async function securityPlugin(fastify, opts) {
  // Register CORS https://github.com/fastify/fastify-cors?tab=readme-ov-file#options
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // 允许没有 Origin 头的请求（如服务器间通信、Postman）
      if (!origin) {
        cb(null, true);
        return;
      }

      // 1. 优先检查 CORS_ORIGIN 环境变量
      if (env.security.corsOrigin) {
        if (env.security.corsOrigin === 'false') {
          cb(new Error('Not allowed by CORS'), false);
          return;
        }
        
        // 解析一次 (生产环境建议缓存这个结果，但这里作为插件闭包也可以)
        const allowedPatterns = parseAllowedOrigins(env.security.corsOrigin);
        
        if (isOriginAllowed(origin, allowedPatterns)) {
          cb(null, true);
          return;
        }
      }

      // 2. 开发环境下，自动允许 localhost 和 127.0.0.1
      if (env.isDev) {
        const url = new URL(origin);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          cb(null, true);
          return;
        }
      }
      
      // 3. 特殊处理：允许 Apple 登录回调的 Origin
      if (origin === 'https://appleid.apple.com') {
          cb(null, true);
          return;
      }

      // 拒绝其他来源
      cb(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
}

export default fp(securityPlugin, {
  name: 'security',
  dependencies: [],
});
