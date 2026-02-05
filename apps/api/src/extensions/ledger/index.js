import fp from 'fastify-plugin';
import { LedgerService } from './services/ledgerService.js';
import ledgerRoutes from './routes.js';

/**
 * 账本扩展
 * 处理虚拟货币和交易系统。
 */
async function ledgerPlugin(fastify, options) {
  const service = new LedgerService(fastify);
  fastify.decorate('ledger', service);

  fastify.register(ledgerRoutes, { prefix: '/api/ledger' });

  fastify.log.info('[账本] 扩展已注册');
}

export default fp(ledgerPlugin, {
  name: 'ledger',
  dependencies: ['db'],
});
