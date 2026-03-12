import pinyin from 'pinyin';

/**
 * 统一生成 Slug 标识
 * 
 * 转换逻辑：
 * 1. 中文转换为拼音（无声调）
 * 2. 转换为小写
 * 3. 将任何非字母数字的字符替换为连字符 '-'
 * 4. 移除首尾及连续重复的连字符
 * 
 * @param {string} text - 需要转换的原始文本
 * @param {Object} options - 配置项
 * @param {string|number} [options.suffix] - 可选后缀（如 ID 或 nanoid 随机字符）
 * @param {number} [options.maxLength] - 最大长度限制（不含后缀，默认保留完整基于拼音的字符串）
 * @returns {string} 生成的 slug
 */
export function generateSlug(text, options = {}) {
  const { suffix, maxLength } = options;
  if (!text) return suffix ? `${suffix}` : '';

  // 1. 将中文转换为拼音
  // style: pinyin.STYLE_NORMAL 表示不要声调 (例如 qian -> qian)
  const pyResult = pinyin.default(text, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false // 禁用多音字，取默认读音
  });
  
  // 拼音结果是一个二维数组，如 [['ce'], ['shi'], ['biao'], ['ti'], ['a']]
  // 或包含英文字符的原样返回
  let processedText = pyResult.map(item => item[0]).join('-');

  // 2-4. 清理并格式化
  // 使用 NFD 拆分音调和字母，移除 [\u0300-\u036f]（所有附加音符），只留下基本英文字母。
  let baseSlug = processedText
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-') // 替换非字母数字字符
    .replace(/-+/g, '-')             // 合并连续连字符
    .replace(/^-+|-+$/g, '');        // 去除首尾连字符

  let resultSlug = baseSlug;

  // 如果提供了后缀，先将其转换为字符串
  const suffixStr = suffix ? `-${suffix}` : '';

  // 限制长度（如果有配置）
  if (maxLength) {
    const maxBaseLength = maxLength - suffixStr.length;
    
    // 如果后缀本身已经超过或等于最大长度，或者不需要前缀
    if (maxBaseLength <= 0) {
      return suffix ? `${suffix}`.substring(0, maxLength) : '';
    }

    if (baseSlug.length > maxBaseLength) {
      baseSlug = baseSlug.substring(0, maxBaseLength);
      // 截断后可能产生尾部连字符，需再清理一次
      baseSlug = baseSlug.replace(/-+$/g, '');
    }
  }

  if (suffix) {
    // 如果 baseSlug 截断后为空，则只返回 suffix
    return baseSlug ? `${baseSlug}${suffixStr}` : `${suffix}`;
  }

  return baseSlug;
}
