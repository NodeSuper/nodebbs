/**
 * 预约提醒短信模板
 */
export default function appointmentReminderTemplate({ service, time, location = '', appName = '我们的平台' }) {
  const locationInfo = location ? `，地点：${location}` : '';
  
  return {
    content: `【${appName}】温馨提醒：您预约的${service}将于${time}开始${locationInfo}，请准时参加。`,
    
    signature: appName,
    
    variables: {
      service,
      time,
      location,
    },
  };
}
