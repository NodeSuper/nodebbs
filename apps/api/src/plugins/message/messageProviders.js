/**
 * 提供商注册表
 * 统一管理所有渠道的提供商
 */

import { emailProviderSenders } from './providers/email/index.js';
import { smsProviderSenders } from './providers/sms/index.js';

/**
 * 消息提供商映射
 */
export const messageProviderRegistry = {
  email: emailProviderSenders,
  sms: smsProviderSenders,
};

/**
 * 获取提供商发送函数
 * @param {string} channel - 渠道类型 ('email' | 'sms')
 * @param {string} provider - 提供商名称
 * @returns {Function|null}
 */
export function getProviderSender(channel, provider) {
  const channelProviders = messageProviderRegistry[channel];
  if (!channelProviders) return null;
  return channelProviders[provider] || null;
}

/**
 * 获取渠道支持的所有提供商
 * @param {string} channel - 渠道类型
 * @returns {string[]}
 */
export function getSupportedProviders(channel) {
  const channelProviders = messageProviderRegistry[channel];
  if (!channelProviders) return [];
  return Object.keys(channelProviders);
}
