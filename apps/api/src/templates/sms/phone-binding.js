/**
 * 手机号绑定验证码模板
 */
export default function phoneBindingTemplate({ code, expiresIn = '5分钟', appName = '我们的平台' }) {
  return {
    content: `【${appName}】您正在绑定手机号，验证码：${code}，${expiresIn}内有效，请勿泄露。`,
    
    signature: appName,
    
    variables: {
      code,
      expiresIn,
    },
  };
}
