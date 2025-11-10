/**
 * 安全提醒短信模板
 */
export default function securityAlertTemplate({ action, time, ipAddress = '', appName = '我们的平台' }) {
  const ipInfo = ipAddress ? `，IP：${ipAddress}` : '';
  
  return {
    content: `【${appName}】您的账号于${time}进行了${action}操作${ipInfo}。若非本人操作，请立即修改密码并联系客服。`,
    
    signature: appName,
    
    variables: {
      action,
      time,
      ipAddress,
    },
  };
}
