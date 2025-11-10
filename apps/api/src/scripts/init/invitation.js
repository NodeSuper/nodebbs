/**
 * 邀请规则默认配置和初始化逻辑
 */

import { invitationRules } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

// 邀请规则默认配置
export const INVITATION_RULES = [
  {
    role: 'user',
    dailyLimit: 1,
    maxUsesPerCode: 1,
    expireDays: 30,
    pointsCost: 0,
    isActive: true,
  },
  {
    role: 'vip',
    dailyLimit: 5,
    maxUsesPerCode: 1,
    expireDays: 60,
    pointsCost: 0,
    isActive: true,
  },
  {
    role: 'moderator',
    dailyLimit: 20,
    maxUsesPerCode: 1,
    expireDays: 90,
    pointsCost: 0,
    isActive: true,
  },
  {
    role: 'admin',
    dailyLimit: 100,
    maxUsesPerCode: 1,
    expireDays: 365,
    pointsCost: 0,
    isActive: true,
  },
];

/**
 * 初始化邀请规则配置
 */
export async function initInvitationRules(db, reset = false) {
  console.log('\n🎫 初始化邀请规则配置...\n');

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const rule of INVITATION_RULES) {
    if (reset) {
      // 重置模式：删除后重新插入
      await db.delete(invitationRules).where(eq(invitationRules.role, rule.role));
      await db.insert(invitationRules).values(rule);
      console.log(`🔄 重置邀请规则: ${rule.role} (每日限制: ${rule.dailyLimit})`);
      updatedCount++;
    } else {
      // 默认模式：只添加缺失的配置
      // 先检查是否已存在
      const [existing] = await db
        .select()
        .from(invitationRules)
        .where(eq(invitationRules.role, rule.role))
        .limit(1);

      if (existing) {
        console.log(`⊙ 跳过邀请规则: ${rule.role} (已存在)`);
        skippedCount++;
      } else {
        // 不存在则插入
        await db.insert(invitationRules).values(rule);
        console.log(`✓ 添加邀请规则: ${rule.role} (每日限制: ${rule.dailyLimit})`);
        addedCount++;
      }
    }
  }

  return { addedCount, updatedCount, skippedCount, total: INVITATION_RULES.length };
}

/**
 * 列出邀请规则配置
 */
export function listInvitationRules() {
  console.log('\n🎫 邀请规则配置\n');
  console.log('='.repeat(80));
  INVITATION_RULES.forEach((rule) => {
    console.log(`  ${rule.role}`);
    console.log(`    每日限制: ${rule.dailyLimit}`);
    console.log(`    每码使用次数: ${rule.maxUsesPerCode}`);
    console.log(`    有效期: ${rule.expireDays} 天`);
    console.log(`    积分消耗: ${rule.pointsCost}`);
    console.log(`    默认状态: ${rule.isActive ? '启用' : '禁用'}`);
    console.log();
  });
  console.log('='.repeat(80));
  console.log(`\n总计: ${INVITATION_RULES.length} 个邀请规则\n`);
}
