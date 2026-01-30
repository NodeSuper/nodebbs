/**
 * Upload Constants
 * 上传相关常量配置
 */

// 全局上传大小限制 (100MB) - 对应 Fastify Multipart 插件的物理限制
export const MAX_UPLOAD_SIZE_GLOBAL_BYTES = 100 * 1024 * 1024;

// 管理员上传大小限制 - 通常与全局限制一致
export const MAX_UPLOAD_SIZE_ADMIN_KB = MAX_UPLOAD_SIZE_GLOBAL_BYTES / 1024;

// 普通用户默认上传大小限制 (5MB) - 若 RBAC 未配置时的后备值
export const MAX_UPLOAD_SIZE_DEFAULT_KB = 5 * 1024;

// 默认允许的文件扩展名
export const DEFAULT_ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'
];

// 扩展名与 MIME 类型的映射关系 (用于安全校验)
export const EXT_MIME_MAP = {
  'jpg': ['image/jpeg'],
  'jpeg': ['image/jpeg'],
  'png': ['image/png'],
  'gif': ['image/gif'],
  'webp': ['image/webp'],
  'svg': ['image/svg+xml'],
  'ico': ['image/x-icon', 'image/vnd.microsoft.icon'],
};
