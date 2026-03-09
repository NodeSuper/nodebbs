import db from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const generateId = customAlphabet(ALPHABET);
const DEFAULT_ID_LENGTH = 8;

/**
 * 生成自动用户名（系统注册，无用户身份信息时使用）
 * 格式: ~{source}_{8位随机字符}
 * ~ 前缀与用户自定义用户名命名空间隔离（用户仅允许 [a-z0-9_]），零误判
 * @param {string} source - 注册来源标识，如 'phone'、'github'、'wechat'
 */
export async function generateAutoUsername(source) {
  const prefix = `~${source}_`;
  const username = `${prefix}${generateId(DEFAULT_ID_LENGTH)}`;
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!existing) return username;
  // 极端碰撞兜底：扩展到12位随机
  return `${prefix}${generateId(12)}`;
}

/**
 * 基于已有身份信息生成唯一用户名（OAuth 等有 profile username 的场景）
 * 清理非法字符后尝试原名，碰撞则追加随机后缀
 * @param {string} baseUsername - 来自 OAuth profile 或邮箱前缀的原始用户名
 */
export async function generateUniqueUsername(baseUsername) {
  // 清理用户名，只保留小写字母、数字和下划线
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  if (username.length < 3) {
    username = username + '_user';
  }
  if (username.length > 50) {
    username = username.substring(0, 50);
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!existingUser) return username;

  // 碰撞时追加随机后缀
  for (let i = 0; i < 10; i++) {
    const suffix = generateId(4);
    const candidate = `${username.slice(0, 45)}_${suffix}`;
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, candidate))
      .limit(1);
    if (!user) return candidate;
  }

  // 最终兜底
  return `${username.slice(0, 41)}_${generateId(DEFAULT_ID_LENGTH)}`;
}
