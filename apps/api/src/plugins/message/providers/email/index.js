/**
 * Email 提供商索引
 * 统一导出所有邮件提供商
 */

export { sendViaSMTP } from './smtp.js';
export { sendViaSendGrid } from './sendgrid.js';
export { sendViaResend } from './resend.js';

/**
 * 提供商发送函数映射
 */
export const emailProviderSenders = {
  smtp: async (config, options) => {
    const { sendViaSMTP } = await import('./smtp.js');
    return sendViaSMTP(config, options);
  },
  sendgrid: async (config, options) => {
    const { sendViaSendGrid } = await import('./sendgrid.js');
    return sendViaSendGrid(config, options);
  },
  resend: async (config, options) => {
    const { sendViaResend } = await import('./resend.js');
    return sendViaResend(config, options);
  },
  // 阿里云邮件推送使用 SMTP 方式
  aliyun: async (config, options) => {
    const { sendViaSMTP } = await import('./smtp.js');
    return sendViaSMTP(config, options);
  },
};
