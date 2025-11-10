/**
 * 手机号变更验证码模板
 */
export default function phoneChangeTemplate({ code, expiresIn = '5分钟', appName = '我们的平台', oldPhone = '' }) {
  const oldPhoneInfo = oldPhone ? `，原手机号：${oldPhone}` : '';
  
  return {
    content: `【${appName}】您正在更换手机号${oldPhoneInfo}，验证码：${code}，${expiresIn}内有效。若非本人操作，请立即联系客服。`,
    
    signature: appName,
    
    variables: {
      code,
      expiresIn,
      oldPhone,
    },
  };
}
