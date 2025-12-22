/**
 * HTTP 相关工具函数
 */

/**
 * 获取请求的前端 Origin
 * 优先级: Origin > Referer > X-Forwarded-Host > Host
 * @param {import('fastify').FastifyRequest} request
 * @returns {string} normalized origin (no trailing slash)
 */
export function getFrontendOrigin(request) {
  let origin = '';

  // 1. 尝试 Origin 头
  if (request.headers.origin) {
    origin = request.headers.origin;
  }
  // 2. 尝试 Referer 头
  else if (request.headers.referer) {
    try {
      const url = new URL(request.headers.referer);
      origin = url.origin;
    } catch (e) {
      // 忽略无效引荐来源
    }
  }

  if (!origin) {
    // 3. 尝试 X-Forwarded-Host (通常由 Nginx/Vercel 等反向代理设置)
    const forwardedHost = request.headers['x-forwarded-host'];
    if (forwardedHost) {
      // 确定协议: X-Forwarded-Proto -> request.protocol -> 'http'
      const forwardedProto = request.headers['x-forwarded-proto'] || request.protocol || 'http';
      
      // X-Forwarded-Host 可能是逗号分隔列表，取第一个
      const host = forwardedHost.split(',')[0].trim();
      origin = `${forwardedProto}://${host}`;
    } else {
      // 4. 回退到请求主机的 Host
      const protocol = request.protocol || 'http';
      const host = request.hostname;
      origin = `${protocol}://${host}`;
    }
  }

  // 确保没有尾部斜杠
  origin = origin.replace(/\/$/, '');

  // 安全检查：根据 CORS_ORIGIN 白名单进行验证
  const allowedOriginsStr = process.env.CORS_ORIGIN || '';
  
  // 使用通用辅助函数进行验证
  if (isOriginAllowed(origin, allowedOriginsStr)) {
      return origin;
  }
  

  
  // 潜在攻击或配置错误：检测到的 origin 不在白名单中。
  // 安全回退策略：

  // 1. 优先使用白名单中的第一个静态域名 (最安全)
  const allowedPatterns = parseAllowedOrigins(allowedOriginsStr);
  const primaryDomain = allowedPatterns.find(p => typeof p === 'string' && !p.includes('*'));
  if (primaryDomain) {
      return primaryDomain;
  }

  // 2. 如果白名单全是通配符或为空，才勉强使用 request.hostname
  //    注意：前端此时需确保反向代理层过滤了非法 Host 头
  const protocol = request.headers['x-forwarded-proto'] || request.protocol || 'http';
  return `${protocol}://${request.hostname}`;
}

/**
 * 解析 CORS_ORIGIN 配置字符串
 * @param {string} allowedOriginsStr
 * @returns {(string|RegExp)[]}
 */
export function parseAllowedOrigins(allowedOriginsStr) {
  if (!allowedOriginsStr) return [];
  if (allowedOriginsStr === '*') return ['*'];

  return allowedOriginsStr.split(',').map((s) => {
    const pattern = s.trim();
    // 1. 如果包含通配符 *，转换为正则
    if (pattern.includes('*')) {
      // 转义除 * 以外的正则特殊字符
      // 将 * 替换为 .*
      const regexStr = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // 转义正则字符
        .replace(/\*/g, '.*');                 // 将 * 转换为通配符
      return new RegExp(`^${regexStr}$`);
    }
    // 2. 普通字符串
    return pattern.replace(/\/$/, '');
  });
}

/**
 * 检查 Origin 是否在允许列表中
 * @param {string} origin - 请求的 Origin (无尾部斜杠)
 * @param {string|string[]} allowedOrigins - 允许列表字符串 或 已解析的数组
 * @returns {boolean}
 */
export function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return false;
  if (!allowedOrigins) return false;

  const patterns = Array.isArray(allowedOrigins) 
    ? allowedOrigins 
    : parseAllowedOrigins(allowedOrigins);

  if (patterns.includes('*')) return true;

  return patterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(origin);
    }
    return pattern === origin;
  });
}
