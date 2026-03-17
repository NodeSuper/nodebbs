import fp from 'fastify-plugin';
import { EVENTS } from '../constants/events.js';
import { sendWebhookRequest, MAX_RETRY_LIMIT } from '../utils/webhook.js';

/**
 * Webhook 监听器插件
 * 监听事件总线的所有事件，根据配置发送 Webhook 请求
 */
async function webhookListenerPlugin(fastify, options) {

  /**
   * 发送 Webhook 请求（带重试）
   */
  async function sendWebhook(event, payload, retryCount = 0) {
    let webhookConfig = {};
    try {
      webhookConfig = await fastify.settings.get('webhook_config', {});
      const enabled = webhookConfig.enabled || false;
      if (!enabled) return;

      const url = webhookConfig.url || '';
      if (!url) return;

      const subscribedEvents = webhookConfig.events || [];
      if (!subscribedEvents.includes(event)) return;

      const secret = webhookConfig.secret || '';
      const timeout = webhookConfig.timeout || 5000;

      const response = await sendWebhookRequest(url, event, payload, { secret, timeout });

      if (!response.ok) {
        throw new Error(`Webhook 响应错误: ${response.status}`);
      }

      fastify.log.info(`[Webhook] 事件 ${event} 发送成功`);
    } catch (error) {
      fastify.log.error({ err: error }, `[Webhook] 事件 ${event} 发送失败 (尝试 ${retryCount + 1})`);

      const maxRetries = Math.min(webhookConfig.retryCount || 3, MAX_RETRY_LIMIT);
      if (retryCount < maxRetries) {
        // 指数退避：1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => sendWebhook(event, payload, retryCount + 1), delay);
      }
    }
  }

  /**
   * 注册全局事件监听器
   */
  const allEvents = Object.values(EVENTS);
  allEvents.forEach((event) => {
    fastify.eventBus.on(event, async (payload) => {
      // 异步发送，不阻塞主流程
      sendWebhook(event, payload).catch((error) => {
        fastify.log.error(error, `[Webhook] 处理事件 ${event} 时出错`);
      });
    });
  });

  fastify.log.info('[Webhook] 监听器已注册');
}

export default fp(webhookListenerPlugin, {
  name: 'webhook-listener',
  dependencies: ['event-bus', 'settings'],
});
