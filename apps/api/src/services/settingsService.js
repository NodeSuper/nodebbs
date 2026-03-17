import db from '../db/index.js';
import { systemSettings } from '../db/schema.js';

// 全量缓存 - 一次查询加载所有设置，避免逐 key 查询
let allCache = null; // { [key]: value }
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1分钟缓存

/**
 * 将数据库中的字符串形式值根据 valueType 转换为真实的 JS 类型
 */
function parseSettingValue(settingValue, valueType, key) {
  let value = settingValue;

  if (valueType === 'boolean') {
    value = settingValue === 'true';
  } else if (valueType === 'number') {
    value = parseFloat(settingValue);
  } else if (valueType === 'json') {
    try {
      value = JSON.parse(settingValue);
    } catch (error) {
      console.error(`[设置] JSON 格式解析失败 (key: ${key}):`, error);
    }
  }

  return value;
}

// 防止并发请求重复加载
let loadingPromise = null;

/**
 * 加载全部设置到缓存
 */
async function loadAllSettings() {
  const now = Date.now();
  if (allCache && now - cacheTimestamp < CACHE_TTL) {
    return allCache;
  }

  // 避免缓存失效瞬间多个并发请求同时查库
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const settings = await db.select().from(systemSettings);
    allCache = settings.reduce((acc, setting) => {
      acc[setting.key] = parseSettingValue(setting.value, setting.valueType, setting.key);
      return acc;
    }, {});
    cacheTimestamp = Date.now();
    return allCache;
  })();

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

/**
 * 获取系统配置值
 * @param {string} key - 配置键名
 * @param {any} defaultValue - 默认值
 * @returns {Promise<any>} 配置值
 */
export async function getSetting(key, defaultValue = null) {
  try {
    const all = await loadAllSettings();
    return key in all ? all[key] : defaultValue;
  } catch (error) {
    // 表不存在时（数据库未初始化），静默返回默认值
    if (error?.cause?.code === '42P01') {
      return defaultValue;
    }
    console.error('[设置] 获取配置项失败:', error);
    return defaultValue;
  }
}

/**
 * 清除配置缓存
 */
export function clearSettingsCache() {
  allCache = null;
  cacheTimestamp = 0;
}

/**
 * 获取系统配置值（getSetting 的别名）
 */
export const getSettingValue = getSetting;

/**
 * 获取所有系统配置
 * @returns {Promise<Object>} 所有配置
 */
export async function getAllSettings() {
  try {
    return await loadAllSettings();
  } catch (error) {
    console.error('[设置] 获取所有配置项失败:', error);
    return {};
  }
}
