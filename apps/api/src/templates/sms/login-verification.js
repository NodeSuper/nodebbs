/**
 * 登录验证码模板
 */
export default function loginVerificationTemplate({ code, expiresIn = '5分钟', appName = '我们的平台', ipAddress = '' }) {
  const ipInfo = ipAddress ? `，登录IP：${ipAddress}` : '';
  
  return {
    content: `【${appName}】您正在登录，验证码：${code}，${expiresIn}内有效${ipInfo}。若非本人操作，请忽略。`,
    
    signature: appName,
    
    variables: {
      code,
      expiresIn,
      ipAddress,
    },
  };
}
