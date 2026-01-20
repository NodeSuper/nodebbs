/**
 * 消息提供商默认配置和初始化逻辑
 * 统一管理 Email 和 SMS 提供商
 */

import { messageProviders } from '../../plugins/message/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * 消息提供商默认配置
 */
export const MESSAGE_PROVIDERS = [
  // ========== Email 提供商 ==========
  {
    channel: 'email',
    provider: 'smtp',
    isEnabled: false,
    isDefault: false,
    displayName: 'SMTP',
    displayOrder: 1,
    config: JSON.stringify({
      smtpHost: null,
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: null,
      smtpPassword: null,
      fromEmail: null,
      fromName: null,
    }),
  },
  {
    channel: 'email',
    provider: 'sendgrid',
    isEnabled: false,
    isDefault: false,
    displayName: 'SendGrid',
    displayOrder: 2,
    config: JSON.stringify({
      apiKey: null,
      apiEndpoint: 'https://api.sendgrid.com/v3/mail/send',
      fromEmail: null,
      fromName: null,
    }),
  },
  {
    channel: 'email',
    provider: 'resend',
    isEnabled: false,
    isDefault: false,
    displayName: 'Resend',
    displayOrder: 3,
    config: JSON.stringify({
      apiKey: null,
      apiEndpoint: 'https://api.resend.com/emails',
      fromEmail: null,
      fromName: null,
    }),
  },
  {
    channel: 'email',
    provider: 'aliyun',
    isEnabled: false,
    isDefault: false,
    displayName: '阿里云邮件推送',
    displayOrder: 4,
    config: JSON.stringify({
      smtpHost: 'smtpdm.aliyun.com',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: null,
      smtpPassword: null,
      fromEmail: null,
      fromName: null,
    }),
  },

  // ========== SMS 提供商 ==========
  {
    channel: 'sms',
    provider: 'aliyun',
    isEnabled: false,
    isDefault: false,
    displayName: '阿里云短信',
    displayOrder: 1,
    config: JSON.stringify({
      accessKeyId: null,
      accessKeySecret: null,
      signName: null,
      region: 'cn-hangzhou',
      // 模板映射配置（可选）
      // 如果需要使用自定义模板 ID，请在此配置：
      // templates: {
      //   SMS_REGISTER: 'SMS_123456789', // 注册验证码模板
      //   SMS_LOGIN: 'SMS_987654321',    // 登录验证码模板
      //   SMS_PASSWORD_RESET: '...',     // 密码重置模板
      //   SMS_BIND: '...',               // 绑定手机模板
      //   SMS_CHANGE: '...'              // 更换手机模板
      // }
    }),
  },
  {
    channel: 'sms',
    provider: 'tencent',
    isEnabled: false,
    isDefault: false,
    displayName: '腾讯云短信',
    displayOrder: 2,
    config: JSON.stringify({
      secretId: null,
      secretKey: null,
      appId: null,
      signName: null,
      region: 'ap-guangzhou',
      // 模板映射配置（可选）
      // 如果需要使用自定义模板 ID，请在此配置：
      // templates: {
      //   SMS_REGISTER: '123456',    // 注册验证码模板
      //   SMS_LOGIN: '654321',       // 登录验证码模板
      //   SMS_PASSWORD_RESET: '...', // 密码重置模板
      //   SMS_BIND: '...',           // 绑定手机模板
      //   SMS_CHANGE: '...'          // 更换手机模板
      // }
    }),
  },
];

/**
 * 初始化消息提供商配置
 * @param {object} db - 数据库实例
 * @param {boolean} reset - 是否重置（删除后重新插入）
 */
export async function initMessageProviders(db, reset = false) {
  console.log('\n📧 初始化消息提供商配置...\n');

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const provider of MESSAGE_PROVIDERS) {
    if (reset) {
      // 重置模式：删除后重新插入
      await db.delete(messageProviders).where(
        and(
          eq(messageProviders.channel, provider.channel),
          eq(messageProviders.provider, provider.provider)
        )
      );
      await db.insert(messageProviders).values(provider);
      console.log(`🔄 重置消息提供商: [${provider.channel}] ${provider.displayName} (${provider.provider})`);
      updatedCount++;
    } else {
      // 默认模式：只添加缺失的配置
      const [existing] = await db
        .select()
        .from(messageProviders)
        .where(
          and(
            eq(messageProviders.channel, provider.channel),
            eq(messageProviders.provider, provider.provider)
          )
        )
        .limit(1);

      if (existing) {
        console.log(`⊙ 跳过消息提供商: [${provider.channel}] ${provider.displayName} (已存在)`);
        skippedCount++;
      } else {
        await db.insert(messageProviders).values(provider);
        console.log(`✓ 添加消息提供商: [${provider.channel}] ${provider.displayName} (${provider.provider})`);
        addedCount++;
      }
    }
  }

  return { addedCount, updatedCount, skippedCount, total: MESSAGE_PROVIDERS.length };
}

/**
 * 列出消息提供商配置
 */
export function listMessageProviders() {
  console.log('\n📧 消息提供商配置\n');
  console.log('='.repeat(80));

  const emailProviders = MESSAGE_PROVIDERS.filter(p => p.channel === 'email');
  const smsProviders = MESSAGE_PROVIDERS.filter(p => p.channel === 'sms');

  console.log('\n📮 Email 提供商:\n');
  emailProviders.forEach((provider) => {
    console.log(`  ${provider.displayName} (${provider.provider})`);
    console.log(`    默认状态: ${provider.isEnabled ? '启用' : '禁用'}`);
    console.log(`    显示顺序: ${provider.displayOrder}`);
    console.log();
  });

  console.log('\n📱 SMS 提供商:\n');
  smsProviders.forEach((provider) => {
    console.log(`  ${provider.displayName} (${provider.provider})`);
    console.log(`    默认状态: ${provider.isEnabled ? '启用' : '禁用'}`);
    console.log(`    显示顺序: ${provider.displayOrder}`);
    console.log();
  });

  console.log('='.repeat(80));
  console.log(`\n总计: ${MESSAGE_PROVIDERS.length} 个消息提供商 (Email: ${emailProviders.length}, SMS: ${smsProviders.length})\n`);
}
