// ✅ 用户名规则：
// - 3~20 个字符
// - 仅允许小写字母、数字、下划线、中划线
// - 必须至少包含一个字母（禁止纯数字）
// - 禁止使用保留用户名（如 admin、root、system）

const USERNAME_REGEX = /^(?=.*[a-z])[a-z0-9_-]{3,20}$/;

// 保留用户名列表，可根据你的项目扩展
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
  'api', 'v1', 'v2', 'graphql', 'static', 'public', 'private', 'secure',

  // 通用无效名
  'test', 'testing', 'demo', 'example', 'sample', 'tmp',
  'null', 'undefined', 'unknown', 'anonymous', 'guest',

  // 平台保留
  'nodebbs', 'forum', 'bbs', 'adminpanel', 'backend', 'front', 'service',
]);

/**
 * 规范化用户名
 * - 转为小写
 * - 去除首尾空格
 */
export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

/**
 * 校验用户名是否合法
 * @param username 原始用户名
 * @returns { valid: boolean, error?: string }
 */
export function validateUsername(username) {
  const normalized = normalizeUsername(username);

  if (normalized.length < 3 || normalized.length > 20) {
    return { valid: false, error: '用户名长度应在 3~20 个字符之间' };
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return {
      valid: false,
      error:
        '用户名仅能包含小写字母、数字、下划线或中划线，且需包含至少一个字母',
    };
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return { valid: false, error: '该用户名已被系统保留，请选择其他名称' };
  }

  return { valid: true };
}



// 使用示例
// import { validateUsername, normalizeUsername } from '@/utils/validateUsername';

// fastify.post('/register', async (request, reply) => {
//   const { username, email, password } = request.body;

//   // 规范化
//   const normalized = normalizeUsername(username);
//   const result = validateUsername(normalized);

//   if (!result.valid) {
//     return reply.code(400).send({ message: result.error });
//   }

//   // 再检查数据库中是否已存在
//   const exists = await db.query.users.findFirst({
//     where: eq(users.username, normalized)
//   });
//   if (exists) {
//     return reply.code(400).send({ message: '用户名已存在' });
//   }

//   // ...后续注册逻辑
// });
