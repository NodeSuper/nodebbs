/**
 * 用户输入规范化工具
 */

/**
 * 规范化邮箱地址
 * - 去除首尾空格
 * - 转换为小写
 * @param {string} email
 * @returns {string|null} 规范化后的邮箱，如果输入为空则返回 null
 */
export function normalizeEmail(email) {
  if (!email) return null;
  return email.trim().toLowerCase();
}

/**
 * 规范化用户名
 * - 去除首尾空格
 * - 转换为小写
 * @param {string} username
 * @returns {string|null} 规范化后的用户名，如果输入为空则返回 null
 */
export function normalizeUsername(username) {
  if (!username) return null;
  return username.trim().toLowerCase();
}

/**
 * 规范化标识符（用户名或邮箱）
 * - 去除首尾空格
 * - 如果看起来像邮箱，则转换为小写
 * @param {string} identifier
 * @returns {string|null} 规范化后的标识符，如果输入为空则返回 null
 */
export function normalizeIdentifier(identifier) {
  if (!identifier) return null;
  
  const trimmed = identifier.trim();
  const isEmail = trimmed.includes('@');
  
  if (isEmail) {
    return trimmed.toLowerCase();
  }
  
  return trimmed;
}
