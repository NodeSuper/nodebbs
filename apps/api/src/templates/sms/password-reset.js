/**
 * 密码重置验证码模板
 */
export default function passwordResetTemplate({ code, expiresIn = '10分钟', appName = '我们的平台' }) {
  return {
    content: `【${appName}】您正在重置密码，验证码：${code}，${expiresIn}内有效。若非本人操作，请立即修改密码。`,
    
    signature: appName,
    
    variables: {
      code,
      expiresIn,
    },
  };
}
