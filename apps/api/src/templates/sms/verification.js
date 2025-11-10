/**
 * 短信验证码模板
 */
export default function verificationTemplate({ code, expiresIn = '5分钟', appName = '我们的平台' }) {
  return {
    // 短信内容（注意：短信有字数限制，通常70字以内）
    content: `【${appName}】您的验证码是：${code}，${expiresIn}内有效，请勿泄露给他人。`,
    
    // 签名（某些短信服务商需要）
    signature: appName,
    
    // 模板变量（用于某些短信服务商的模板系统）
    variables: {
      code,
      expiresIn,
    },
  };
}
