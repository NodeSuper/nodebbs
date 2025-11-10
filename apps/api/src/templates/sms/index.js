/**
 * 短信模板索引
 * 统一管理所有短信模板
 */
import verificationTemplate from './verification.js';
import loginVerificationTemplate from './login-verification.js';
import passwordResetTemplate from './password-reset.js';
import phoneBindingTemplate from './phone-binding.js';
import phoneChangeTemplate from './phone-change.js';
import registerTemplate from './register.js';
import securityAlertTemplate from './security-alert.js';
import paymentNotificationTemplate from './payment-notification.js';
import orderStatusTemplate from './order-status.js';
import appointmentReminderTemplate from './appointment-reminder.js';
import activityNotificationTemplate from './activity-notification.js';

const templates = {
  // 验证码类
  verification: verificationTemplate,                 // 通用验证码
  'login-verification': loginVerificationTemplate,    // 登录验证码
  'password-reset': passwordResetTemplate,            // 密码重置验证码
  'phone-binding': phoneBindingTemplate,              // 手机号绑定验证码
  'phone-change': phoneChangeTemplate,                // 手机号变更验证码
  register: registerTemplate,                         // 注册验证码
  
  // 通知类
  'security-alert': securityAlertTemplate,            // 安全提醒
  'payment-notification': paymentNotificationTemplate, // 支付通知
  'order-status': orderStatusTemplate,                // 订单状态
  'appointment-reminder': appointmentReminderTemplate, // 预约提醒
  'activity-notification': activityNotificationTemplate, // 活动通知
};

/**
 * 获取短信模板
 * @param {string} templateName - 模板名称
 * @param {object} data - 模板数据
 * @returns {object} { content, signature, variables }
 */
export function getSmsTemplate(templateName, data) {
  const template = templates[templateName];
  
  if (!template) {
    throw new Error(`短信模板不存在: ${templateName}`);
  }
  
  return template(data);
}

/**
 * 获取所有可用的模板名称
 */
export function getAvailableSmsTemplates() {
  return Object.keys(templates);
}

/**
 * 按类别获取模板
 */
export function getSmsTemplatesByCategory() {
  return {
    verification: [
      'verification',
      'login-verification',
      'password-reset',
      'phone-binding',
      'phone-change',
      'register',
    ],
    notification: [
      'security-alert',
      'payment-notification',
      'order-status',
      'appointment-reminder',
      'activity-notification',
    ],
  };
}

export default {
  getSmsTemplate,
  getAvailableSmsTemplates,
  getSmsTemplatesByCategory,
};
