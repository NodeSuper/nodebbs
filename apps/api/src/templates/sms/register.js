/**
 * 注册验证码模板
 */
export default function registerTemplate({ code, expiresIn = '10分钟', appName = '我们的平台' }) {
  return {
    content: `【${appName}】欢迎注册！您的验证码是：${code}，${expiresIn}内有效，请尽快完成注册。`,
    
    signature: appName,
    
    variables: {
      code,
      expiresIn,
    },
  };
}
