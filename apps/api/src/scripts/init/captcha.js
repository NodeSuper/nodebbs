/**
 * CAPTCHA 提供商初始化数据
 */
import { eq } from 'drizzle-orm';
import { captchaProviders } from '../../db/schema.js';

// 预定义的 CAPTCHA 提供商
const CAPTCHA_PROVIDERS = [
  {
    provider: 'recaptcha',
    displayName: 'Google reCAPTCHA',
    displayOrder: 1,
    isEnabled: false,
    isDefault: false,
    config: JSON.stringify({
      version: 'v2', // v2 或 v3
      siteKey: '',
      secretKey: '',
      scoreThreshold: 0.5, // v3 专用
    }),
    enabledScenes: JSON.stringify({
      register: false,
      login: false,
    }),
  },
  {
    provider: 'hcaptcha',
    displayName: 'hCaptcha',
    displayOrder: 2,
    isEnabled: false,
    isDefault: false,
    config: JSON.stringify({
      siteKey: '',
      secretKey: '',
    }),
    enabledScenes: JSON.stringify({
      register: false,
      login: false,
    }),
  },
  {
    provider: 'turnstile',
    displayName: 'Cloudflare Turnstile',
    displayOrder: 3,
    isEnabled: false,
    isDefault: false,
    config: JSON.stringify({
      siteKey: '',
      secretKey: '',
      mode: 'managed', // managed, non-interactive, invisible
    }),
    enabledScenes: JSON.stringify({
      register: false,
      login: false,
    }),
  },
  {
    provider: 'cap',
    displayName: 'Cap (自托管 PoW)',
    displayOrder: 4,
    isEnabled: false,
    isDefault: false,
    config: JSON.stringify({
      // Cap Standalone 模式需配置 API 端点
      apiEndpoint: '', // 例如: http://localhost:3000
      siteKey: '',     // 前端需要
      secretKey: '',   // 后端调用 /siteverify 需要
    }),
    enabledScenes: JSON.stringify({
      register: false,
      login: false,
    }),
  },
];

/**
 * 初始化 CAPTCHA 提供商配置
 * @param {*} db - 数据库连接
 * @param {boolean} reset - 是否重置配置
 */
export async function initCaptchaProviders(db, reset = false) {
  console.log('📋 初始化 CAPTCHA 提供商配置...');

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const provider of CAPTCHA_PROVIDERS) {
    const [existing] = await db
      .select()
      .from(captchaProviders)
      .where(eq(captchaProviders.provider, provider.provider))
      .limit(1);

    if (existing) {
      if (reset) {
        // 重置模式：更新配置但保留用户设置的密钥
        await db
          .update(captchaProviders)
          .set({
            displayName: provider.displayName,
            displayOrder: provider.displayOrder,
          })
          .where(eq(captchaProviders.provider, provider.provider));
        updatedCount++;
        console.log(`  ✓ 更新: ${provider.displayName}`);
      } else {
        skippedCount++;
        console.log(`  - 跳过: ${provider.displayName}（已存在）`);
      }
    } else {
      // 新增
      await db.insert(captchaProviders).values(provider);
      addedCount++;
      console.log(`  ✓ 新增: ${provider.displayName}`);
    }
  }

  return {
    addedCount,
    updatedCount,
    skippedCount,
    total: CAPTCHA_PROVIDERS.length,
  };
}

/**
 * 列出所有 CAPTCHA 提供商
 */
export function listCaptchaProviders() {
  console.log('\n=== CAPTCHA 提供商列表 ===\n');
  CAPTCHA_PROVIDERS.forEach((provider, index) => {
    console.log(`${index + 1}. ${provider.displayName} (${provider.provider})`);
  });
  console.log();
}
