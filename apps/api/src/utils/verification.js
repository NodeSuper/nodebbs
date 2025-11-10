import db from '../db/index.js';
import { verifications } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * 生成验证码值
 * @param {string} format - 格式类型：'token' | 'numeric' | 'alphanumeric'
 * @param {number} length - 长度（仅用于 numeric 和 alphanumeric）
 * @returns {string} 生成的验证码
 */
function generateVerificationValue(format = 'token', length = 6) {
  switch (format) {
    case 'numeric':
      // 生成数字验证码，如 123456
      return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
    
    case 'alphanumeric':
      // 生成字母数字混合验证码，如 A1B2C3
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    
    case 'token':
    default:
      // 生成长 token，如 a1b2c3d4e5f6...
      return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * 创建验证码
 * @param {string} identifier - 标识符（邮箱、手机号等）
 * @param {string} type - 验证类型
 * @param {number|null} userId - 用户ID（可选）
 * @param {number} expiresInMs - 过期时间（毫秒）
 * @param {object} options - 可选配置
 * @param {string} options.format - 验证码格式：'token' | 'numeric' | 'alphanumeric'
 * @param {number} options.length - 验证码长度（仅用于 numeric 和 alphanumeric）
 * @returns {Promise<string>} 验证码 token
 */
export async function createVerification(
  identifier,
  type,
  userId = null,
  expiresInMs = 3600000,
  options = {}
) {
  const { format = 'token', length = 6 } = options;
  const value = generateVerificationValue(format, length);
  const expiresAt = new Date(Date.now() + expiresInMs);

  await db.insert(verifications).values({
    identifier,
    value,
    type,
    userId,
    expiresAt,
  });

  return value;
}

/**
 * 验证并获取验证码记录
 * @param {string} value - 验证码 token
 * @param {string} type - 验证类型
 * @param {string|null} identifier - 标识符（邮箱、手机号等），用于防止短验证码撞库
 * @returns {Promise<object|null>} 验证码记录或 null
 */
export async function verifyToken(value, type, identifier = null) {
  const conditions = [
    eq(verifications.value, value),
    eq(verifications.type, type),
    gt(verifications.expiresAt, new Date())
  ];

  // 如果提供了 identifier，添加到查询条件中（防止短验证码撞库）
  if (identifier) {
    conditions.push(eq(verifications.identifier, identifier));
  }

  const [verification] = await db
    .select()
    .from(verifications)
    .where(and(...conditions))
    .limit(1);

  return verification || null;
}

/**
 * 删除验证码
 * @param {string} value - 验证码 token
 * @param {string} type - 验证类型
 * @param {string|null} identifier - 标识符（可选，用于精确删除）
 */
export async function deleteVerification(value, type, identifier = null) {
  const conditions = [
    eq(verifications.value, value),
    eq(verifications.type, type)
  ];

  if (identifier) {
    conditions.push(eq(verifications.identifier, identifier));
  }

  await db
    .delete(verifications)
    .where(and(...conditions));
}

/**
 * 删除用户的所有某类型验证码
 * @param {number} userId - 用户ID
 * @param {string} type - 验证类型
 */
export async function deleteUserVerifications(userId, type) {
  await db
    .delete(verifications)
    .where(
      and(
        eq(verifications.userId, userId),
        eq(verifications.type, type)
      )
    );
}

/**
 * 清理过期的验证码
 */
export async function cleanupExpiredVerifications() {
  const result = await db
    .delete(verifications)
    .where(gt(new Date(), verifications.expiresAt));
  
  return result;
}

// 验证类型常量
export const VerificationType = {
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  TWO_FACTOR: '2fa',
  PHONE_VERIFICATION: 'phone_verification',
  MAGIC_LINK: 'magic_link',
};

// 验证码格式常量
export const VerificationFormat = {
  TOKEN: 'token',           // 64位十六进制 token（默认）
  NUMERIC: 'numeric',       // 纯数字验证码
  ALPHANUMERIC: 'alphanumeric', // 字母数字混合
};

/**
 * 便捷函数：创建邮箱验证码（长 token）
 */
export async function createEmailVerification(email, userId) {
  return createVerification(
    email,
    VerificationType.EMAIL_VERIFICATION,
    userId,
    7 * 24 * 60 * 60 * 1000, // 7 天
    { format: VerificationFormat.TOKEN }
  );
}

/**
 * 便捷函数：创建密码重置验证码（长 token）
 */
export async function createPasswordReset(email, userId) {
  return createVerification(
    email,
    VerificationType.PASSWORD_RESET,
    userId,
    3600000, // 1 小时
    { format: VerificationFormat.TOKEN }
  );
}

/**
 * 便捷函数：创建手机验证码（6位数字）
 */
export async function createPhoneVerification(phone, userId = null) {
  return createVerification(
    phone,
    VerificationType.PHONE_VERIFICATION,
    userId,
    300000, // 5 分钟
    { format: VerificationFormat.NUMERIC, length: 6 }
  );
}

/**
 * 便捷函数：创建双因素认证码（6位数字）
 */
export async function create2FACode(identifier, userId) {
  return createVerification(
    identifier,
    VerificationType.TWO_FACTOR,
    userId,
    300000, // 5 分钟
    { format: VerificationFormat.NUMERIC, length: 6 }
  );
}
