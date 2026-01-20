/**
 * 邮件模板索引
 * 从原 src/templates/email/ 迁移
 */
import welcomeTemplate from './welcome.js';
import verificationCodeTemplate from './verification-code.js';

const templates = {
  welcome: welcomeTemplate,
  'verification-code': verificationCodeTemplate,
};

/**
 * 获取邮件模板
 * @param {string} templateName - 模板名称
 * @param {object} data - 模板数据
 * @returns {object} { subject, html, text }
 */
export function getEmailTemplate(templateName, data) {
  const template = templates[templateName];
  
  if (!template) {
    throw new Error(`邮件模板不存在: ${templateName}`);
  }
  
  return template(data);
}

/**
 * 获取所有可用的模板名称
 */
export function getAvailableTemplates() {
  return Object.keys(templates);
}

export default {
  getEmailTemplate,
  getAvailableTemplates,
};
