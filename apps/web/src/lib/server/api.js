// SSR请求专用
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../api-url';

// 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = 20000;

export const request = async (endpoint, options = {}) => {
  const baseURL = getApiBaseUrl();
  const url = `${baseURL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const cks = await cookies();
  const token = cks.get('auth_token')?.value;
  if (token) {
    // headers['Authorization'] = `Bearer ${token}`;
    headers['Cookie'] = `auth_token=${token}`;
  }

  // 设置超时控制器
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const defaultCache = options.method && options.method !== 'GET' ? 'no-store' : undefined;

    const response = await fetch(url, {
      ...options,
      // 对于 GET 请求使用默认缓存策略，让 Next.js 自动去重同一渲染周期内的相同请求
      // 对于其他请求（POST/PUT/DELETE）使用 no-store
      cache: options.cache ?? defaultCache,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 404 静默返回 null（向后兼容）
      if (response.status === 404) {
        return null;
      }

      // 其他 HTTP 错误抛出带状态码的错误，以便调用者区分处理
      let errorMessage = 'Failed to fetch';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // 忽略解析错误
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // 如果是带状态码的错误（HTTP 错误响应），重新抛出以便调用者处理
    if (error.status) {
      throw error;
    }

    // 区分超时错误和其他错误
    if (error.name === 'AbortError') {
      console.error(`[SSR] 请求超时 (${timeout}ms): ${url}`);
    } else {
      console.error(`[SSR] 请求失败 ${url}:`, error.message);
    }
    return null;
  }
};

// 增强用户对象，添加权限辅助属性（与 AuthContext 中的 enhanceUser 保持一致）
function enhanceUser(user) {
  if (!user) return null;

  const enhanced = {
    ...user,
    // 基于 RBAC 的 isAdmin 属性（不依赖旧 role 字段）
    isAdmin: user.userRoles?.some(r => r.slug === 'admin') ?? false,
  };

  return enhanced;
}

// 获取当前登录用户 (SSR专用)
// 优化：只有在存在 auth_token cookie 时才发请求
// /auth/me 接口已包含 RBAC 权限数据 (userRoles, permissions, displayRole)
export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('auth_token');

  if (!hasToken) {
    return null;
  }

  try {
    const user = await request('/auth/me');
    return enhanceUser(user);
  } catch (error) {
    // token 过期/无效等情况，静默返回 null（视为未登录）
    return null;
  }
};
