'use strict';

import Fastify from 'fastify';
import pino from 'pino';
import server from './server.js';
import { isDev } from './utils/env.js';

const loggerInstance = pino({
  level: isDev ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
  },
});

const app = Fastify({
  loggerInstance,
  disableRequestLogging: true, // 禁用默认的请求日志
});

app.register(server);

app.listen(
  { port: process.env.PORT || 7100, host: process.env.HOST || '0.0.0.0' },
  (err, address) => {
    console.log(`服务启动成功，访问地址: ${address}`);
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  }
);
