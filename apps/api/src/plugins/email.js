import fp from 'fastify-plugin';
import db from '../db/index.js';
import { emailProviders } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getEmailTemplate } from '../templates/email/index.js';

/**
 * 邮件服务插件配置
 * 支持 SMTP, SendGrid, Resend, 阿里云邮件推送等提供商
 * 从数据库动态读取配置，无需重启即可生效
 */
async function emailPlugin(fastify, opts) {
  fastify.log.info('Initializing Email plugin with database configuration');

  // 添加一个装饰器方法，用于获取提供商配置
  // 这个方法会实时从数据库读取最新配置
  fastify.decorate('getEmailProviderConfig', async (providerName) => {
    const result = await db
      .select()
      .from(emailProviders)
      .where(eq(emailProviders.provider, providerName))
      .limit(1);
    
    return result[0] || null;
  });

  // 获取默认邮件提供商配置
  fastify.decorate('getDefaultEmailProvider', async () => {
    const result = await db
      .select()
      .from(emailProviders)
      .where(and(
        eq(emailProviders.isEnabled, true),
        eq(emailProviders.isDefault, true)
      ))
      .limit(1);
    
    return result[0] || null;
  });

  // 实际发送邮件的内部方法（假设参数已验证）
  async function _sendEmailInternal(provider, { to, subject, html, text }) {
    // 根据不同的提供商发送邮件
    switch (provider.provider) {
      case 'smtp':
        return await sendViaSMTP(provider, { to, subject, html, text });
      case 'sendgrid':
        return await sendViaSendGrid(provider, { to, subject, html, text });
      case 'resend':
        return await sendViaResend(provider, { to, subject, html, text });
      case 'aliyun':
        return await sendViaAliyun(provider, { to, subject, html, text });
      default:
        throw new Error(`不支持的邮件提供商: ${provider.provider}`);
    }
  }

  // 发送邮件的通用方法（不阻塞响应）
  // 支持两种方式：
  // 1. 使用模板：{ to, template, data }
  // 2. 直接传入内容：{ to, subject, html, text }
  // 
  // 使用方式：await fastify.sendEmail({ ... })
  // 该方法会先进行同步验证（参数、配置等），验证通过后立即返回
  // 实际发送在后台异步完成，不阻塞响应
  fastify.decorate('sendEmail', async (options) => {
    const { to, subject, html, text, template, data, provider: providerName } = options;
    
    // ===== 同步验证阶段：立即检查并抛出错误 =====
    
    // 准备邮件内容（如果使用模板）
    let finalSubject = subject;
    let finalHtml = html;
    let finalText = text;
    
    if (template) {
      const rendered = getEmailTemplate(template, data || {});
      finalSubject = finalSubject || rendered.subject;
      finalHtml = finalHtml || rendered.html;
      finalText = finalText || rendered.text;
    }
    
    // 验证必需参数
    if (!to) {
      throw new Error('收件人地址 (to) 是必需的');
    }
    if (!finalSubject) {
      throw new Error('邮件主题 (subject) 是必需的');
    }
    if (!finalHtml && !finalText) {
      throw new Error('邮件内容 (html 或 text) 是必需的');
    }
    
    // 验证邮件服务配置
    let provider;
    if (providerName) {
      provider = await fastify.getEmailProviderConfig(providerName);
    } else {
      provider = await fastify.getDefaultEmailProvider();
    }
    
    if (!provider || !provider.isEnabled) {
      throw new Error('邮件服务未配置或未启用');
    }
    
    // ===== 异步发送阶段：后台执行，不阻塞响应 =====
    
    // 验证通过后，在后台异步发送邮件
    _sendEmailInternal(provider, { 
      to, 
      subject: finalSubject, 
      html: finalHtml, 
      text: finalText 
    })
      .then((result) => {
        fastify.log.info(`[邮件发送成功] 收件人: ${to}, 模板: ${template || '自定义'}, MessageId: ${result.messageId || 'N/A'}`);
      })
      .catch((error) => {
        // 这里捕获的是实际发送时的错误（网络、SMTP 等）
        fastify.log.error(`[邮件发送失败] 收件人: ${to}, 模板: ${template || '自定义'}, 错误: ${error.message}`);
      });
    
    // 立即返回，不等待邮件发送完成
    return { queued: true };
  });

  fastify.log.info('Email plugin initialized successfully');
}

/**
 * 通过 SMTP 发送邮件 测试通过
 * https://github.com/nodemailer/nodemailer
 */
async function sendViaSMTP(provider, { to, subject, html, text }) {
  // 动态导入 nodemailer
  const { default: nodemailer } = await import('nodemailer');

  const transporter = nodemailer.createTransport({
    host: provider.smtpHost,
    port: provider.smtpPort,
    secure: provider.smtpSecure,
    auth: {
      user: provider.smtpUser,
      pass: provider.smtpPassword,
    },
  });

  const info = await transporter.sendMail({
    from: `"${provider.fromName}" <${provider.fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  return { success: true, messageId: info.messageId };
}

/**
 * 通过 SendGrid 发送邮件
 * https://www.twilio.com/docs/sendgrid/for-developers/sending-email/quickstart-nodejs
 */
async function sendViaSendGrid(provider, { to, subject, html, text }) {
  const response = await fetch(provider.apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: provider.fromEmail, name: provider.fromName },
      subject,
      content: [
        { type: 'text/plain', value: text || '' },
        { type: 'text/html', value: html || '' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid 发送失败: ${error}`);
  }

  return { success: true, messageId: response.headers.get('x-message-id') };
}

/**
 * 通过 Resend 发送邮件
 * https://resend.com/docs/send-with-nodejs
 */
async function sendViaResend(provider, { to, subject, html, text }) {
  const response = await fetch(provider.apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${provider.fromName} <${provider.fromEmail}>`,
      to: [to],
      subject,
      html: html || text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend 发送失败: ${error.message || JSON.stringify(error)}`);
  }

  const result = await response.json();
  return { success: true, messageId: result.id };
}

/**
 * 通过阿里云邮件推送发送邮件
 */
async function sendViaAliyun(provider, { to, subject, html, text }) {
  // 阿里云邮件推送使用 SMTP 方式
  return await sendViaSMTP(provider, { to, subject, html, text });
}

export default fp(emailPlugin, {
  name: 'email-plugin',
});
