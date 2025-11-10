/**
 * 系统设置默认配置和初始化逻辑
 */

import { systemSettings } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

// 系统设置默认配置
export const SETTING_KEYS = {
  // 通用设置
  SITE_NAME: {
    key: 'site_name',
    value: '我的论坛',
    valueType: 'string',
    description: '站点名称',
    category: 'general',
  },
  SITE_DESCRIPTION: {
    key: 'site_description',
    value: '一个基于 Node.js 和 React 的现代化论坛系统',
    valueType: 'string',
    description: '站点描述',
    category: 'general',
  },

  // 功能开关
  REGISTRATION_MODE: {
    key: 'registration_mode',
    value: 'open',
    valueType: 'string',
    description: '注册模式：open（开放注册）、invitation（邀请码注册）、closed（关闭注册）',
    category: 'features',
  },
  EMAIL_VERIFICATION_REQUIRED: {
    key: 'email_verification_required',
    value: 'false',
    valueType: 'boolean',
    description: '是否要求用户验证邮箱后才能进行创建话题、回复、发站内信等操作',
    category: 'features',
  },
  CONTENT_MODERATION_ENABLED: {
    key: 'content_moderation_enabled',
    value: 'false',
    valueType: 'boolean',
    description: '是否启用内容审核（新发布的内容需要审核后才能公开显示）',
    category: 'features',
  },

  // 访问限速
  RATE_LIMIT_ENABLED: {
    key: 'rate_limit_enabled',
    value: 'true',
    valueType: 'boolean',
    description: '是否启用访问限速',
    category: 'rate_limit',
  },
  RATE_LIMIT_WINDOW_MS: {
    key: 'rate_limit_window_ms',
    value: '60000',
    valueType: 'number',
    description: '限速时间窗口（毫秒），默认60秒',
    category: 'rate_limit',
  },
  RATE_LIMIT_MAX_REQUESTS: {
    key: 'rate_limit_max_requests',
    value: '100',
    valueType: 'number',
    description: '时间窗口内最大请求数',
    category: 'rate_limit',
  },
  RATE_LIMIT_AUTH_MULTIPLIER: {
    key: 'rate_limit_auth_multiplier',
    value: '2',
    valueType: 'number',
    description: '已登录用户的限速倍数',
    category: 'rate_limit',
  },
};

// 将配置按分类分组
export const SETTINGS_BY_CATEGORY = Object.values(SETTING_KEYS).reduce((acc, setting) => {
  const category = setting.category || 'other';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(setting);
  return acc;
}, {});

export const CATEGORY_NAMES = {
  general: '通用设置',
  features: '功能开关',
  rate_limit: '访问限速',
  other: '其他设置',
};

/**
 * 初始化系统设置
 */
export async function initSystemSettings(db, reset = false) {
  const allSettings = Object.values(SETTING_KEYS);
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const setting of allSettings) {
    const { key, value, valueType, description } = setting;

    if (reset) {
      // 重置模式：删除后重新插入
      await db.delete(systemSettings).where(eq(systemSettings.key, key));
      await db.insert(systemSettings).values({
        key,
        value,
        valueType,
        description,
      });
      console.log(`🔄 重置配置: ${key} = ${value}`);
      updatedCount++;
    } else {
      // 默认模式：只添加缺失的配置
      // 先检查是否已存在
      const [existing] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);

      if (existing) {
        console.log(`⊙ 跳过配置: ${key} (已存在)`);
        skippedCount++;
      } else {
        // 不存在则插入
        await db.insert(systemSettings).values({
          key,
          value,
          valueType,
          description,
        });
        console.log(`✓ 添加配置: ${key} = ${value}`);
        addedCount++;
      }
    }
  }

  return { addedCount, updatedCount, skippedCount, total: allSettings.length };
}

/**
 * 列出系统设置配置
 */
export function listSystemSettings() {
  console.log('\n📋 系统配置列表\n');
  console.log('='.repeat(80));

  Object.entries(SETTINGS_BY_CATEGORY).forEach(([category, settings]) => {
    console.log(`\n${CATEGORY_NAMES[category] || category}:`);
    console.log('-'.repeat(80));

    settings.forEach((setting) => {
      console.log(`  ${setting.key}`);
      console.log(`    类型: ${setting.valueType}`);
      console.log(`    默认值: ${setting.value}`);
      console.log(`    描述: ${setting.description}`);
      console.log();
    });
  });

  console.log('='.repeat(80));
  console.log(`\n总计: ${Object.values(SETTING_KEYS).length} 个配置项\n`);
}
