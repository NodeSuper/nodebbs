/**
 * SMS 提供商索引
 * 统一导出所有短信提供商
 */

export { sendViaAliyun } from './aliyun.js';
export { sendViaTencent } from './tencent.js';

/**
 * 提供商发送函数映射
 */
export const smsProviderSenders = {
  aliyun: async (config, options) => {
    const { sendViaAliyun } = await import('./aliyun.js');
    return sendViaAliyun(config, options);
  },
  tencent: async (config, options) => {
    const { sendViaTencent } = await import('./tencent.js');
    return sendViaTencent(config, options);
  },
};
