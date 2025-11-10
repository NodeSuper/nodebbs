/**
 * 活动通知短信模板
 */
export default function activityNotificationTemplate({ activityName, time, link = '', appName = '我们的平台' }) {
  const linkInfo = link ? `，详情：${link}` : '';
  
  return {
    content: `【${appName}】${activityName}将于${time}开始${linkInfo}，期待您的参与！退订回T`,
    
    signature: appName,
    
    variables: {
      activityName,
      time,
      link,
    },
  };
}
