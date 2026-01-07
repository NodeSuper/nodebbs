// ✅ 用户名规则：
// - 3~20 个字符
// - 仅允许小写字母、数字、下划线、中划线
// - 必须至少包含一个字母（禁止纯数字）
// - 禁止使用保留用户名（如 admin、root、system）

const USERNAME_REGEX = /^(?=.*[a-z])[a-z0-9_-]{3,20}$/;

// 保留用户名列表，与后端保持一致
const RESERVED_USERNAMES = new Set([
  // 系统/管理类
  'admin', 'root', 'system', 'sys', 'support', 'moderator', 'mod',
  'staff', 'operator', 'owner', 'official', 'team',

  // 功能/路由类
  'api', 'app', 'assets', 'auth', 'cdn', 'config', 'dashboard', 'dev',
  'help', 'status', 'setup', 'settings', 'user', 'users', 'profile',
  'login', 'logout', 'register', 'signup', 'signin', 'reset', 'password',
  'forgot', 'verify', 'activation', 'token', 'session', 'docs',

  // 常见页面
  'home', 'index', 'about', 'contact', 'terms', 'privacy', 'policy', 'faq',
  'news', 'blog', 'feed', 'forum', 'community', 'topic', 'topics', 'post',
  'posts', 'comment', 'comments', 'category', 'categories', 'tag', 'tags',

  // 技术保留词
  'v1', 'v2', 'graphql', 'static', 'public', 'private', 'secure',

  // 通用无效名
  'test', 'testing', 'demo', 'example', 'sample', 'tmp',
  'null', 'undefined', 'unknown', 'anonymous', 'guest',

  // 平台保留
  'nodebbs', 'bbs', 'adminpanel', 'backend', 'front', 'service',
]);

/**
 * 规范化用户名（转小写并去除首尾空格）
 * @param {string} username 原始用户名
 * @returns {string} 规范化后的用户名
 */
export function normalizeUsername(username) {
  return (username || '').trim().toLowerCase();
}

/**
 * 校验用户名是否合法
 * @param {string} username 原始用户名
 * @returns {{ valid: boolean, error?: string }} 验证结果
 */
export function validateUsername(username) {
  const normalized = normalizeUsername(username);

  if (normalized.length < 3 || normalized.length > 20) {
    return { valid: false, error: '用户名长度应在 3~20 个字符之间' };
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return {
      valid: false,
      error: '用户名仅能包含小写字母、数字、下划线或中划线，且需包含至少一个字母',
    };
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return { valid: false, error: '该用户名已被系统保留，请选择其他名称' };
  }

  return { valid: true };
}
