import fp from 'fastify-plugin';
import badgeRoutes from './routes/index.js';
import { registerBadgeListeners } from './listeners.js';
import registerBadgeEnricher from './enricher.js';

/**
 * 勋章扩展
 * 处理成就勋章和用户荣誉系统。
 */
async function badgesPlugin(fastify, options) {
  // 注册路由
  fastify.register(badgeRoutes, { prefix: '/api/badges' });

  // 注册事件监听器
  registerBadgeListeners(fastify);

  // 注册用户数据增强器
  registerBadgeEnricher(fastify);

  fastify.log.info('[勋章] 扩展已注册');
}

export default fp(badgesPlugin, {
  name: 'badges',
  dependencies: ['event-bus', 'ledger'],
});
