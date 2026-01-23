import fp from 'fastify-plugin';
import * as settingsService from '../services/settingsService.js';

/**
 * 系统配置插件
 * 
 * 将 settingsService 注册为 fastify.settings
 * 
 * 使用方式：
 * const siteName = await fastify.settings.get('site_name');
 * const all = await fastify.settings.getAll();
 */
async function settingsPlugin(fastify, options) {
  // 为了保持 API 简洁，我们将常用方法直接挂载
  // 或者直接挂载整个 service 对象
  
  const settingsDecorator = {
    get: settingsService.getSetting,
    getAll: settingsService.getAllSettings,
    clearCache: settingsService.clearSettingsCache,
    // 保留原始引用以便访问其他可能导出的方法
    ...settingsService
  };

  fastify.decorate('settings', settingsDecorator);

  fastify.log.info('[Settings] 配置服务已注册');
}

export default fp(settingsPlugin, {
  name: 'settings',
  dependencies: []
});
