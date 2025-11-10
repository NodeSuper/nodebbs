/**
 * Verification 工具函数使用示例
 */

import {
  createVerification,
  createEmailVerification,
  createPasswordReset,
  createPhoneVerification,
  create2FACode,
  verifyToken,
  deleteVerification,
  VerificationType,
  VerificationFormat,
} from './verification.js';

// ============ 示例 1: 邮箱验证（使用便捷函数）============
async function example1_emailVerification() {
  const email = 'user@example.com';
  const userId = 123;

  // 创建邮箱验证码（自动使用长 token，7天有效期）
  const token = await createEmailVerification(email, userId);
  console.log('邮箱验证 token:', token);
  // 输出: a1b2c3d4e5f6...（64位十六进制）

  // 验证 token（邮箱验证建议传入 identifier 以提高安全性）
  const verification = await verifyToken(token, VerificationType.EMAIL_VERIFICATION, email);
  if (verification) {
    console.log('验证成功，用户ID:', verification.userId);
    // 删除已使用的验证码
    await deleteVerification(token, VerificationType.EMAIL_VERIFICATION, email);
  }
}

// ============ 示例 2: 密码重置（使用便捷函数）============
async function example2_passwordReset() {
  const email = 'user@example.com';
  const userId = 123;

  // 创建密码重置验证码（自动使用长 token，1小时有效期）
  const token = await createPasswordReset(email, userId);
  console.log('密码重置 token:', token);
  // 输出: a1b2c3d4e5f6...（64位十六进制）
}

// ============ 示例 3: 手机验证码（6位数字）============
async function example3_phoneVerification() {
  const phone = '+86 138 0000 0000';
  const userId = 123;

  // 创建手机验证码（6位数字，5分钟有效期）
  const code = await createPhoneVerification(phone, userId);
  console.log('手机验证码:', code);
  // 输出: 123456（6位数字）

  // 验证验证码（必须传入 phone 防止撞库）
  const verification = await verifyToken(code, VerificationType.PHONE_VERIFICATION, phone);
  if (verification) {
    console.log('验证成功');
    // 删除已使用的验证码
    await deleteVerification(code, VerificationType.PHONE_VERIFICATION, phone);
  }
}

// ============ 示例 4: 双因素认证（6位数字）============
async function example4_twoFactorAuth() {
  const email = 'user@example.com';
  const userId = 123;

  // 创建2FA验证码（6位数字，5分钟有效期）
  const code = await create2FACode(email, userId);
  console.log('2FA 验证码:', code);
  // 输出: 654321（6位数字）
}

// ============ 示例 5: 自定义格式（4位数字）============
async function example5_customNumeric() {
  const identifier = 'user@example.com';
  const userId = 123;

  // 创建自定义长度的数字验证码
  const code = await createVerification(
    identifier,
    'custom_verification',
    userId,
    600000, // 10 分钟
    { format: VerificationFormat.NUMERIC, length: 4 }
  );
  console.log('4位验证码:', code);
  // 输出: 1234（4位数字）
}

// ============ 示例 6: 字母数字混合（8位）============
async function example6_alphanumeric() {
  const identifier = 'user@example.com';
  const userId = 123;

  // 创建字母数字混合验证码
  const code = await createVerification(
    identifier,
    'invite_code',
    userId,
    30 * 24 * 60 * 60 * 1000, // 30 天
    { format: VerificationFormat.ALPHANUMERIC, length: 8 }
  );
  console.log('邀请码:', code);
  // 输出: A1B2C3D4（8位字母数字）
}

// ============ 示例 7: 注册前验证（无 userId）============
async function example7_preRegistration() {
  const email = 'newuser@example.com';

  // 注册前发送验证码（此时还没有 userId）
  const code = await createVerification(
    email,
    VerificationType.EMAIL_VERIFICATION,
    null, // userId 为 null
    3600000, // 1 小时
    { format: VerificationFormat.NUMERIC, length: 6 }
  );
  console.log('注册验证码:', code);
  // 输出: 789012（6位数字）

  // 用户输入验证码后验证（必须传入 email 防止撞库）
  const verification = await verifyToken(code, VerificationType.EMAIL_VERIFICATION, email);
  if (verification) {
    console.log('邮箱验证通过，可以继续注册');
    // 创建用户...
    // 删除验证码
    await deleteVerification(code, VerificationType.EMAIL_VERIFICATION, email);
  }
}

// ============ 使用场景总结 ============
/*
1. 邮箱验证链接 → 使用 createEmailVerification() 或 format: 'token'
   - 长度：64位十六进制
   - 有效期：7天
   - 场景：邮件中的验证链接
   - 安全性：建议验证时传入 identifier

2. 密码重置链接 → 使用 createPasswordReset() 或 format: 'token'
   - 长度：64位十六进制
   - 有效期：1小时
   - 场景：邮件中的重置链接
   - 安全性：建议验证时传入 identifier

3. 手机验证码 → 使用 createPhoneVerification() 或 format: 'numeric'
   - 长度：6位数字
   - 有效期：5分钟
   - 场景：短信验证码
   - 安全性：⚠️ 必须验证时传入 identifier（手机号）防止撞库攻击

4. 双因素认证 → 使用 create2FACode() 或 format: 'numeric'
   - 长度：6位数字
   - 有效期：5分钟
   - 场景：登录时的二次验证
   - 安全性：⚠️ 必须验证时传入 identifier 防止撞库攻击

5. 邀请码 → format: 'alphanumeric'
   - 长度：自定义（建议6-8位）
   - 有效期：长期（如30天）
   - 场景：用户邀请系统
   - 安全性：根据长度决定是否需要 identifier

6. 自定义场景 → 使用 createVerification() 完全自定义
   - 格式：token / numeric / alphanumeric
   - 长度：自定义
   - 有效期：自定义
   - 安全性：短验证码（<10位）必须传入 identifier

⚠️ 安全提示：
- 6位数字验证码只有 100 万种可能，必须在验证时传入 identifier 防止撞库
- 长 token（64位十六进制）虽然撞库几率极低，但仍建议传入 identifier 提高安全性
- 验证码使用后应立即删除，防止重复使用
*/

export {
  example1_emailVerification,
  example2_passwordReset,
  example3_phoneVerification,
  example4_twoFactorAuth,
  example5_customNumeric,
  example6_alphanumeric,
  example7_preRegistration,
};
