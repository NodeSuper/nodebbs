/**
 * 邮件服务提供商默认配置和初始化逻辑
 */

import { emailProviders } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

// 邮件服务提供商默认配置
export const EMAIL_PROVIDERS = [
  {
    provider: 'smtp',
    isEnabled: false,
    isDefault: false,
    displayName: 'SMTP',
    displayOrder: 1,
    smtpHost: null,
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: null,
    smtpPassword: null,
    fromEmail: null,
    fromName: null,
    apiKey: null,
    apiEndpoint: null,
    additionalConfig: null,
  },
  {
    provider: 'sendgrid',
    isEnabled: false,
    isDefault: false,
    displayName: 'SendGrid',
    displayOrder: 2,
    smtpHost: null,
    smtpPort: null,
    smtpSecure: null,
    smtpUser: null,
    smtpPassword: null,
    fromEmail: null,
    fromName: null,
    apiKey: null,
    apiEndpoint: 'https://api.sendgrid.com/v3/mail/send',
    additionalConfig: null,
  },
  {
    provider: 'resend',
    isEnabled: false,
    isDefault: false,
    displayName: 'Resend',
    displayOrder: 3,
    smtpHost: null,
    smtpPort: null,
    smtpSecure: null,
    smtpUser: null,
    smtpPassword: null,
    fromEmail: null,
    fromName: null,
    apiKey: null,
    apiEndpoint: 'https://api.resend.com/emails',
    additionalConfig: null,
  },
  {
    provider: 'aliyun',
    isEnabled: false,
    isDefault: false,
    displayName: '阿里云邮件推送',
    displayOrder: 4,
    smtpHost: 'smtpdm.aliyun.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: null,
    smtpPassword: null,
    fromEmail: null,
    fromName: null,
    apiKey: null,
    apiEndpoint: null,
    additionalConfig: null,
  },
];

/**
 * 初始化邮件服务提供商配置
 */
export async function initEmailProviders(db, reset = false) {
  console.log('\n📧 初始化邮件服务提供商配置...\n');

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const provider of EMAIL_PROVIDERS) {
    if (reset) {
      // 重置模式：删除后重新插入
      await db.delete(emailProviders).where(eq(emailProviders.provider, provider.provider));
      await db.insert(emailProviders).values(provider);
      console.log(`🔄 重置邮件服务提供商: ${provider.displayName} (${provider.provider})`);
      updatedCount++;
    } else {
      // 默认模式：只添加缺失的配置
      // 先检查是否已存在
      const [existing] = await db
        .select()
        .from(emailProviders)
        .where(eq(emailProviders.provider, provider.provider))
        .limit(1);

      if (existing) {
        console.log(`⊙ 跳过邮件服务提供商: ${provider.displayName} (已存在)`);
        skippedCount++;
      } else {
        // 不存在则插入
        await db.insert(emailProviders).values(provider);
        console.log(`✓ 添加邮件服务提供商: ${provider.displayName} (${provider.provider})`);
        addedCount++;
      }
    }
  }

  return { addedCount, updatedCount, skippedCount, total: EMAIL_PROVIDERS.length };
}

/**
 * 列出邮件服务提供商配置
 */
export function listEmailProviders() {
  console.log('\n📧 邮件服务提供商配置\n');
  console.log('='.repeat(80));
  EMAIL_PROVIDERS.forEach((provider) => {
    console.log(`  ${provider.displayName} (${provider.provider})`);
    console.log(`    默认状态: ${provider.isEnabled ? '启用' : '禁用'}`);
    console.log(`    显示顺序: ${provider.displayOrder}`);
    if (provider.smtpHost) {
      console.log(`    SMTP 主机: ${provider.smtpHost}:${provider.smtpPort}`);
    }
    if (provider.apiEndpoint) {
      console.log(`    API 端点: ${provider.apiEndpoint}`);
    }
    console.log();
  });
  console.log('='.repeat(80));
  console.log(`\n总计: ${EMAIL_PROVIDERS.length} 个邮件服务提供商\n`);
}
