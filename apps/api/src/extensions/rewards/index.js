import fp from 'fastify-plugin';
import rewardsRoutes from './routes/index.js';
import checkInRoutes from './routes/checkin.js';
import { registerRewardListeners } from './listeners.js';

/**
 * 奖励扩展
 * 处理奖励系统逻辑、路由和事件监听器。
 */
async function rewardsPlugin(fastify, options) {
  // 注册路由
  fastify.register(rewardsRoutes, { prefix: '/api/rewards' });
  fastify.register(checkInRoutes, { prefix: '/api' });

  // 注册事件监听器
  await registerRewardListeners(fastify);

  fastify.log.info('[奖励] 扩展已注册');
}

export default fp(rewardsPlugin, {
  name: 'rewards',
  dependencies: ['event-bus', 'ledger'],
});
