import db from '../db/index.js';
import { systemSettings } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// 缓存系统配置 - 使用 Map 存储每个 key 的独立缓存
// Map 结构: key -> { value: any, timestamp: number }
const settingsCache = new Map();
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
    } catch (e) {
      console.error(`[设置] JSON 格式解析失败 (key: ${key}):`, e);
    }
  }

  return value;
}

/**
 * 获取系统配置值
 * @param {string} key - 配置键名
 * @param {any} defaultValue - 默认值
 * @returns {Promise<any>} 配置值
 */
export async function getSetting(key, defaultValue = null) {
  // 检查缓存
  const now = Date.now();
  const cached = settingsCache.get(key);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (!setting) {
      return defaultValue;
    }

    const value = parseSettingValue(setting.value, setting.valueType, key);

    // 更新缓存 - 每个 key 有独立的时间戳
    settingsCache.set(key, { value, timestamp: now });

    return value;
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
  settingsCache.clear();
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
    const settings = await db.select().from(systemSettings);

    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = parseSettingValue(setting.value, setting.valueType, setting.key);
      return acc;
    }, {});

    return formattedSettings;
  } catch (error) {
    console.error('[设置] 获取所有配置项失败:', error);
    return {};
  }
}
