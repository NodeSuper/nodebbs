import fp from 'fastify-plugin';
import adsRoutes from './routes/index.js';

/**
 * 广告插件
 * 处理广告系统逻辑和路由。
 */
async function adsPlugin(fastify, options) {
  // 注册路由
  fastify.register(adsRoutes, { prefix: '/api/ads' });

  fastify.log.info('[广告] 扩展已注册');
}

export default fp(adsPlugin, {
  name: 'ads',
  dependencies: [],
});
